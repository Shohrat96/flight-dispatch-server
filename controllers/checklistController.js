const DispatcherChecklist = require("../models/DispatcherChecklist");

exports.saveChecklist = async (req, res) => {
    const { scheduleOperations, flightDispatch, remarksHistory, dispatcherTakingOver, email, shift } = req.body;

    try {
        const checklist = await DispatcherChecklist.create({
            schedule_operations: scheduleOperations,
            flight_dispatch: flightDispatch,
            remarks_history: remarksHistory,
            dispatchertakingover: dispatcherTakingOver,
            email: email,
            shift: shift
        });

        res.status(201).json({
            message: "Checklist and user saved successfully",
            data: checklist,
        });
    } catch (error) {
        console.error("Error saving checklist and user:", error);
        res.status(500).json({ error: "Failed to save checklist and user" });
    }
};
