const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DispatcherChecklist = sequelize.define("DispatcherChecklist", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    schedule_operations: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    flight_dispatch: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    remarks_history: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    dispatchertakingover: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: "dispatcher_checklist",
    timestamps: true,
});

module.exports = DispatcherChecklist;
