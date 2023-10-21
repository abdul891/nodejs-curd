const response = require("../config/response");
const { Validator } = require("node-input-validator");
const helper = require("../helper/helper");
const task = require("../model/task");


//------------------CREATE THE TASK------------------------

const createTask = async (req, res) => {
  const reqData = req.body;
  reqData.attachmentFile = req.file?.filename;
  //console.log(req.id);
  const userId = req.id;
  try {
    let validation = new Validator(reqData, {
      title: "required|string",
      attachmentFile: "required",
      due_date: "required|dateFormat:YYYY-MM-DD",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        401,
        helper.validationErrorConvertor(validation),
        {}
      );
    }
    if (!helper.checkValidDate(reqData.due_date)) {
      return response.returnFalse(req, res,401, 'Please provide valid date', {});
    }
    reqData.due_date = helper.convertIntoTimeStamp(reqData.due_date);
    reqData.createdBy = userId;
    const newTask = new task(reqData);
    const saveTask = await newTask.save();

    if (saveTask) {
      return response.returnTrue(
        req,
        res,
        200,
        'Task created successfully',
        saveTask
      );
    } else {
      return response.returnFalse(req, res,404, 'try again later', {});
    }
  } catch (error) {
    
    return response.returnFalse(req, res,500, 'internal server error', {});
  }
};

//-------------------GET ALL THE TASKS-----------------------

const getAllTask = async (req, res) => {
  const userId = req.id;
  try {
    const taskData = await task.find({ createdBy: userId });
    if (taskData.length > 0) {
      return response.returnTrue(req, res,200,'successfully fetched', taskData);
    } else {
      return response.returnFalse(req, res, 404, 'task not found', {});
    }
  } catch (error) {
    //console.error("Error list task:", error);
    return response.returnFalse(req, res,500, 'internal server error', {});
  }
};

//---------------------UPDATE THE TASK INFORMATION---------------------

const editTask = async (req, res) => {
  try {
    const { due_date, title } = req.body;
    const id = req.params.id;
    const attachmentFile = req.file?.filename;

    const updateInfo = {};

    const validation = new Validator(req.body, {
      title: "string",
      due_date: "dateFormat:YYYY-MM-DD",
    });

    const isValid = await validation.check();
    if (!isValid) {
      return response.returnFalse(
        req,
        res,
        401,
        helper.validationErrorConvertor(validation),
        {}
      );
    }

    if (due_date) {
      if (!helper.checkValidDate(due_date)) {
        return response.returnFalse(req, res,401, 'please provide valid date', {});
      }
      updateInfo.due_date = helper.convertIntoTimeStamp(due_date);
    }

    if (title) {
      updateInfo.title = title;
    }

    if (attachmentFile) {
      updateInfo.attachmentFile = attachmentFile;
    }
     try{
      let result = await task.findByIdAndUpdate(id, updateInfo, {new : true});
      return response.returnTrue(req, res,401, 'successfully update', result);
     }
     catch(error)
     {
      return response.returnFalse(req, res,500, 'internal server error', {});
     }
    
    
  } catch (error) {
    console.error("Error updating task:", error);
    return response.returnFalse(req, res,500, 'internal server error', {});
  }
};

//------------------DELTE THE TASK FROM DB------------------------

const deleteTask = async (req, res) => {
  try {
    let exitTask = await task.findById(req.params.id);
     if(!exitTask)
     {
      return response.returnFalse(req, res,404, 'Task not found', {});
     }
    await task.findByIdAndDelete(req.params.id);
    return response.returnTrue(req, res,200, 'delte successfully',{});
  } catch (error) {
   console.log(error);
    return response.returnFalse(req, res,500, 'internal server error', {});
  }
};
const deleteMultipleTasks = async (req, res) => {
  try {
    const taskIds = req.body.taskIds; // Assuming taskIds is an array of task IDs in the request body.

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return response.returnFalse(req, res, 400, 'Invalid input. Task IDs array is required.', {});
    }

    const deletedTasks = await task.deleteMany({ _id: { $in: taskIds } });

    if (deletedTasks.deletedCount === 0) {
      return response.returnFalse(req, res, 404, 'Tasks not found', {});
    }

    return response.returnTrue(req, res, 200, 'Deleted successfully', { deletedTasks });
  } catch (error) {
    console.log(error);
    return response.returnFalse(req, res, 500, 'Internal server error', {});
  }
};
module.exports = {getAllTask,deleteTask,editTask,createTask,deleteMultipleTasks}