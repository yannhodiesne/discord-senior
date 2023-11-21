type IConfiguration = {
	sqlite: {
		path: string,
	}
};

export const Configuration: IConfiguration = {
	sqlite: {
		path: 'sqlite://data/db.sqlite',
	},
};
