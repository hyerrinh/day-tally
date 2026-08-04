const settingList = [{ id: "123", title: "카테고리 및 행동 관리", href: "/settings/categories" }];

const page = () => {
	return (
		<div>
			<ul>
				{settingList.map((item) => {
					return (
						<li key={item.id}>
							<a href={item.href}> {item.title}</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default page;
