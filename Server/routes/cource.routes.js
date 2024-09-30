import { fileURLToPath } from "url";
import path from "path";
import express, { Router, json } from "express";
import { UserModel, QuestionModel } from "../models/user.js";
import ErrorHandler from "../middlewar/ErrorHandler.js";
import ejs from "ejs";
import sendMail from "../utils/sendMail.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import { CatchAsyncError } from "../middlewar/catchAsynErrors.js";
import {
  authorizeRole,
  isAutheticated,
  isAutheticatedPaid,
} from "../middlewar/auth.js";
import { redis } from "../utils/redis.js";
import mongoose, { Error } from "mongoose";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routes = express.Router();
import { freeCourse, staticCourse } from "../models/course.js";
import { paidCourse } from "../models/course.js";
import {
  createFreeCourse,
  createPaidCourse,
  createStaticCourse,
  getAllFreeCoursesService,
  getAllPaidCoursesService,
  getAllStaticCoursesService,
} from "../service/course.service.js";
import notificationModel from "../models/notification.js";

// get all the static course -- admin
routes.get(
  "/get-all-static-course",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      getAllStaticCoursesService(res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all the paid course  -- admin

routes.get(
  "/get-all-paid-course",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      getAllPaidCoursesService(res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all the free course  -- admin

routes.get(
  "/get-all-free-course",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      getAllFreeCoursesService(res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all the static course  -- admin

routes.get(
  "/get-all-static-course",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      getAllStaticCoursesService(res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// creating new cource  --admin
routes.post(
  "/courses/paid",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    const courseData = req.body;
    console.log(courseData)
    try {
      // upload thumbnail
      const data = req.body;
      console.log("data",data)
      console.log("data",data.modules.quizzes)

      const thumbnail = data.thumbnail || undefined;
      

      if (thumbnail) {
        const result = await cloudinary.v2.uploader.upload(req.body.thumbnail, {
          folder: "courses",
        });
        thumbnail = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      // Create a new paid course
      const course = await paidCourse.create({
        ...courseData,
        thumbnail,
      });
      console.log("cource", course)

      const courses = await paidCourse.find();

      await redis.set("allPaidCourse", JSON.stringify(courses));

      res.status(201).json({
        success: true,
        message: "Paid course created successfully",
        course,
      });

    } catch (err) {
      console.log(err.message)
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

// editing paid course
routes.put(
  "/course/edit/paid/:id",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    const courseId = req.params.id;
    const updatedCourseData = req.body;

    try {
      const course = await paidCourse.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      // Handle thumbnail update
      if (updatedCourseData.thumbnail) {
        // Delete the existing thumbnail
        if (course.thumbnail.public_id) {
          await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        }

        // Upload the new thumbnail
        const result = await cloudinary.v2.uploader.upload(
          updatedCourseData.thumbnail,
          {
            folder: "courses",
          }
        );

        course.thumbnail = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      // Process modules
      const processedModules = await Promise.all(
        updatedCourseData.module.map(async (module) => {
          const processedVideos = await Promise.all(
            module.videos.map(async (video) => {
              if (video.videoThumbnail) {
                // Delete the existing video thumbnail
                if (video.videoThumbnail.public_id) {
                  await cloudinary.v2.uploader.destroy(
                    video.videoThumbnail.public_id
                  );
                }

                // Upload the new video thumbnail
                const result = await cloudinary.v2.uploader.upload(
                  video.videoThumbnail,
                  {
                    folder: "course-videos",
                  }
                );

                return {
                  ...video,
                  videoThumbnail: {
                    public_id: result.public_id,
                    url: result.secure_url,
                  },
                };
              }

              return video;
            })
          );

          return {
            ...module,
            videos: processedVideos,
          };
        })
      );
      // Update the course
      course.name = updatedCourseData.name || course.name;
      course.description = updatedCourseData.description || course.description;
      course.tag = updatedCourseData.tag || course.tag;
      course.level = updatedCourseData.level || course.level;
      course.module = processedModules;

      await course.save();

      res.status(200).json({
        success: true,
        message: "Paid course updated successfully",
        course,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

// create the free course
routes.post(
  "/courses/free",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail || undefined;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      // const modules = data.modules || [];

      const course = await freeCourse.create(data);


      const courses = await freeCourse.find();
      await redis.set("allFreeCourse", JSON.stringify(courses));

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// edit the free course

routes.put(
  "/courses/edit/free/:id",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail || undefined;
      const courseId = req.params.id;
      const course = await freeCourse.findById(courseId);
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courses = await freeCourse.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      res.status(201).json({
        success: true,
        courses,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete a course -- admin only

routes.delete(
  "/delete-course/:id",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { course } = req.body;

      const validSchemas = ["paidCourse", "freeCourse", "staticCourse"];
      if (!validSchemas.includes(course)) {
        return next(new ErrorHandler("Invalid course schema", 400));
      }

      let courseModel;
      switch (course) {
        case "paidCourse":
          courseModel = paidCourse;
          break;
        case "freeCourse":
          courseModel = freeCourse;
          break;
        case "staticCourse":
          courseModel = staticCourse;
          break;
        default:
          return next(new ErrorHandler("Invalid course schema", 400));
      }

      const deletedCourse = await courseModel.findByIdAndDelete(id);
      if (!deletedCourse) {
        return next(new ErrorHandler("Course not found", 404));
      }

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// creating the course for the static page

routes.post(
  "/static_course",
  CatchAsyncError(async (req, res, next) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: (await myCloud).public_id,
          url: (await myCloud).secure_url,
        };
      }
      createStaticCourse(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// editing the static course

routes.put(
  "/edit_static_course/:id",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail || undefined;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await staticCourse.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// geting single course without perchasing in static page

routes.get(
  "/get-single-course-static/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const courseId = req.params.id;

      const isCastExist = await redis.get(courseId);

      if (isCastExist) {
        const course = JSON.parse(isCastExist);

        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await staticCourse.findById(req.params.id);
        await redis.set(courseId, JSON.stringify(course), "EX", 604800);


        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// geting all course in static page without purchasing

routes.get(
  "/get-all-courses-static",
  CatchAsyncError(async (req, res, next) => {
    try {
      const courseId = req.params.id;

      const isCastExist = await redis.get("allCourseInStatic");
      if (isCastExist) {
        const course = JSON.parse(isCastExist);
        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await staticCourse.find();

        await redis.set("allCourseInStatic", JSON.stringify(course));
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// geting all course in paid page with purchasing

routes.get(
  "/get-all-paid-courses",
  isAutheticatedPaid,
  CatchAsyncError(async (req, res, next) => {
    try {
      const isCastExist = await redis.get("allPaidCourse");
      if (isCastExist) {
        const course = await redis.get(isCastExist);
        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await paidCourse.find();

        await redis.set("allPaidCourse", JSON.stringify(course));

        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// geting all course in free page with purchasing

routes.get(
  "/get-all-free-courses",
  CatchAsyncError(async (req, res, next) => {
    try {
      const isCastExist = await redis.get("allFreeCourse");

      if (isCastExist) {
        const course = JSON.parse(isCastExist);

        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await freeCourse.find();

        await redis.set("allFreeCourse", JSON.stringify(course));

        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

routes.get(
  "/get-single-free-course/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const courseId = req.params.id;

      const isCastExist = await redis.get(courseId);

      if (isCastExist) {
        const course = JSON.parse(isCastExist);
        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await freeCourse.findById(req.params.id);
        await redis.set(courseId, JSON.stringify(course));
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// getting single courses in paid courses
routes.get(
  "/get-single-paid-course/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const courseId = req.params.id;

      const isCastExist = await redis.get(courseId);

      if (isCastExist) {
        const course = JSON.parse(isCastExist);
        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await paidCourse.findById(req.params.id);
        await redis.set(courseId, JSON.stringify(course));
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// which course was purchased by the user

routes.get(
  "/users-course-content/:id",
  isAutheticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const userCoursesList = req.user.courses;

      const courseId = req.params.id;

      const courseExist = userCoursesList.find(
        (course) => course._id.toString() === courseId
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not Eligible to Access this resourse", 404)
        );
      }
      const course = await paidCourse.findById(courseId);
      const content = course.course;

      res.status(201).json({
        success: true,
        content,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 404));
    }
  })
);

// add questions in course in the paid courses.
// add questions in course in the paid courses.
routes.get(
  "/get-all-user-questions",
  isAutheticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const questions = await QuestionModel.find({ 'user._id': req.user._id });
      res.status(201).json({
        success: true,
        questions,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500)); // Use 500 for server errors
    }
  })
);


routes.post(
  "/questions-in-course",
  isAutheticatedPaid,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { question, courseId, moduleId } = req.body;
      const course = await paidCourse.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Invalid Course ID", 400)); // Use 400 for bad request
      }

      const courseModule = course.module.find((item) =>
        item._id.equals(moduleId)
      );

      if (!courseModule) {

        return next(new ErrorHandler("Invalid Module ID", 400)); // Use 400 for bad request
      }

      const questions = {
        user: { _id: req.user._id, name: req.user.name, email: req.user.email },
        question,
        courseId: course._id,
        courseName: course.name,
        moduleName: courseModule.heading,
        answered: false,
        questionReplays: [],
      };

      await QuestionModel.create(questions);

      const notifications = {
        user: req.user._id,
        title: "New Questions",
        message: `You have a new question in the module of ${courseModule.heading} and in the course of ${course.name}`,
      };

      await notificationModel.create(notifications);
      await course.save();

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// only for admin
routes.get(
  "/get-all-question-admin",
  isAutheticated,
  authorizeRole("admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const questions = await QuestionModel.find();
      res.status(201).json({
        success: true,
        questions,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// adding replay to the questions in the paid courses.

routes.put(
  "/add-answer",
  isAutheticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { answer, questionId, courseName } = req.body;

      const question = await QuestionModel.findById(questionId);

      if (!question) {
        return next(new ErrorHandler("Invalid Question Id", 400));
      }

      question.questionReplays.push(answer);
      question.answered = true;

      await question.save();

      const maildata = {
        name: question.user.name,
        title: courseName,
      };
      
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/question-replay.ejs"),
        maildata
      );
      try {
        console.log(question.user.email)
        await sendMail({
          email: question.user.email,
          subject: "Question Replay",
          template: "question-replay.ejs",
          data: maildata,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
      console.log(maildata)

      res.status(200).json({
        success: true,
        question,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default routes;
