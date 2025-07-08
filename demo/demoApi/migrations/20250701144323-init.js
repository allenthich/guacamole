/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},

			membershipId: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},

			membershipLevel: {
				type: Sequelize.STRING,
			},

			password: {
				type: Sequelize.STRING,
				allowNull: false,

				default: "1234afsd",
			},

			createdAt: {
				type: Sequelize.DATE,

				default: Sequelize.NOW,
			},

			updatedAt: {
				type: Sequelize.DATE,

				default: Sequelize.NOW,
			},
		});
		await queryInterface.createTable("test", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},

			membershipId: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},

			membershipLevel: {
				type: Sequelize.STRING,
			},

			password: {
				type: Sequelize.STRING,
				allowNull: false,

				default: "1234afsd",
			},

			createdAt: {
				type: Sequelize.DATE,

				default: Sequelize.NOW,
			},

			updatedAt: {
				type: Sequelize.DATE,

				default: Sequelize.NOW,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("user");
		await queryInterface.dropTable("test");
	},
};
