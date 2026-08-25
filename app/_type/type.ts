import { Prisma, Record } from "../generated/prisma/client";

export type CategoryWithActions = Prisma.CategoryGetPayload<{
	include: {
		actions: true;
	};
}>;

export type RecordResponse = Omit<Record, "recordDate" | "createdAt" | "updatedAt"> & {
	recordDate: string;
	createdAt: string;
	updatedAt: string;
};

export type Records = { [actionId: string]: RecordResponse[] };
