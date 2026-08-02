"use client";
import { useEffect, useState } from "react";
import { Category } from "./generated/prisma/client";

async function updateCategory({ id, name }: { id: string; name: string }) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error();
  }

  const data = await res.json();

  return data;
}

async function getCategories() {
  const res = await fetch("/api/categories");

  if (!res.ok) {
    throw new Error();
  }

  const data = await res.json();
  return data;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    async function getInitialData() {
      const data = await getCategories();
      setCategories(data);
    }

    getInitialData();
  }, []);

  return (
    <div>
      <ul>
        {categories.map((category) => {
          const isEdit = category.id === editingId;
          return (
            <li>
              <input
                type='text'
                value={isEdit ? editValue : category.name}
                disabled={!isEdit}
                onChange={(e) => {
                  setEditValue(e.target.value);
                }}
              />
              <button
                type='button'
                className='ml-2'
                onClick={async () => {
                  if (isEdit) {
                    if (category.name !== editValue) {
                      try {
                        const updatedCategory = await updateCategory({
                          id: category.id,
                          name: editValue,
                        });

                        setCategories((prev) => {
                          return prev.map((cat) => {
                            if (cat.id === category.id) {
                              return updatedCategory;
                            }

                            return cat;
                          });
                        });
                      } catch (error) {
                        console.log(error);
                        return;
                      }
                    }

                    setEditingId(null);
                  } else {
                    setEditingId(category.id);
                    setEditValue(category.name);
                  }
                }}
              >
                {isEdit ? "저장" : "수정"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
