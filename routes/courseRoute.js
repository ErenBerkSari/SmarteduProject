const express = require('express');
const courseController = require('../controllers/courseController');
const roleMiddlewares = require('../middlewares/roleMiddlewares');

const router = express.Router();

router
  .route('/')
  .post(roleMiddlewares(['teacher', 'admin']), courseController.createCourse); // http://localhost:3000/courses
router.route('/').get(courseController.getAllCourses);
router.route('/:slug').get(courseController.getCourse);
router.route('/:slug').delete(courseController.deleteCourse);
router.route('/:slug').put(courseController.updateCourse);
router.route('/enroll').post(courseController.enrollCourse);
router.route('/release').post(courseController.releaseCourse);

module.exports = router;
