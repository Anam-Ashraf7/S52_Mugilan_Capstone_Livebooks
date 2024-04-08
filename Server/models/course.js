import mongoose from "mongoose";

// review schema

const reviewSchema = new mongoose.Schema({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
}, { timestamps: true });




// link Schema

const linkSchema = new mongoose.Schema({
  title: String,
  url: String,
}, { timestamps: true });



// commentSchema

const commentSchema = new mongoose.Schema({
  user: Object,
  question: String,
  questionReplays: [Object],
}, { timestamps: true });




// landing page schema

const landingPageCourses = new mongoose.Schema({
    thumbnail : {
        public_id : {
        
            type: String
        },
        url :{
            type:String,
      
        }
    },
    name : {
        type:String,
        require:true,
    },
    phase : {
        require : true,
        type :[Object]},
    price : {
        type:Number,
        require : true,
    },
    estimatedPrice:  {
        type:Number,
        require : true,
    },
    language:  {
        type:String,
        require : true,
    },
    tags: {
        require : true,
        type :[Object]
    },
    benifits: {
        require : true,
        type :[Object]
    },
    preRequirement: {
        type:String,
        require : true,
    },
    review: {
        require : true,
        type :[reviewSchema]
    },
    rating :{
        type:Number,
        default:0
    },
    purchaces : {
        type : Number,
        default : 0
    },
    level: {
        type:String,
        require : true,
    },
    type : {
        type: String,

    },
    courseId:{
        type:Object,
        require: true
    },
    question : [commentSchema]

},  { timestamps: true });



// Quiz Question Schema
const quizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
  });
  
// Quiz Schema
const quizSchema = new mongoose.Schema({
title: { type: String, required: true },
questions: [quizQuestionSchema],
});

// video Schema

const courseVideoSchema = new mongoose.Schema({
  videoUrl: String,
  videoThumbnail: Object,
  title: String,
  videoSelection: String,
  videoDescribtion: String,
  videoLength : Number,
  videoPlayer : String,

} , { timestamps: true });


// Assignment Submission Schema
const assignmentSubmissionSchema = new mongoose.Schema({
    student: [Object],
    submittedAt: { type: Date, default: Date.now },
    file: { type: String, required: true },
  });
  
  // Assignment Schema
const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    submissions: [assignmentSubmissionSchema],
  });
  
  // Cheat Sheet Content Schema
const cheatSheetContentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    typeOf: String,
    image: String,
    description: String,
    credits: String,
    text: String
  });
  
  // Cheat Sheet Schema
const cheatSheetSchema = new mongoose.Schema({
    heading: String,
    subHeading: String,
    content: [cheatSheetContentSchema],
  });

  // Module Schema
const moduleSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    subHeading: { type: String, required: true },
    videos: [courseVideoSchema],
    quizzes: [quizSchema],
    assignments: [assignmentSchema],
    cheatSheets: [cheatSheetSchema],
    links : [linkSchema],
    questions : [commentSchema]
  });

// paid cource schema

const livebooksPaidCourse = new mongoose.Schema({

    name : {
        type:String,
        require:true,
    },
    describtion: {
        type:String,
        require : true,
    },
    thumbnail : {
        public_id : {
            require : true,
            type: String
        },
        url :{
            type:String,
            require:true
        }
    },
    tag :{
        type :String,
        require :true
    },
    level : {
        type :String,
        require:true
        
    },
    course : [moduleSchema],
},   { timestamps: true })






// free cource 

const livebooksFreeCourse = new mongoose.Schema({

    name : {
        type:String,
        require:true,
    },
    describtion: {
        type:String,
        require : true,
    },
    thumbnail : {
        public_id : {
            type: String
        },
        url :{
            type:String,
        }
    },
    tag :{
        type :String,
        require :true
    },
    level : {
        type :String,
        require:true
        
    },
    course : [moduleSchema],

},  { timestamps: true })

const freeCourse = mongoose.model('freecourses', livebooksFreeCourse)
const paidCourse = mongoose.model('paidcourses', livebooksPaidCourse)
const staticCourse = mongoose.model('staticources', landingPageCourses)


export {freeCourse, paidCourse, staticCourse}