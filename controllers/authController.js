const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash('error', error.msg);
    });
    return res.status(400).redirect('/register');
  }

  try {
    const user = await User.create(req.body);
    res.status(201).redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while creating the user.');
    res.status(500).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User does not exist!');
      return res.status(400).redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      req.session.userID = user._id;
      return res.status(200).redirect('/users/dashboard');
    } else {
      req.flash('error', 'Your password is incorrect!');
      return res.status(400).redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).redirect('/');
    }
    res.redirect('/');
  });
};

exports.getDashboardPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID).populate('courses');
    const categories = await Category.find();
    const courses = await Course.find({ user: req.session.userID });
    const users = await User.find();

    res.status(200).render('dashboard', {
      page_name: 'dashboard',
      user,
      categories,
      courses,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Course.deleteMany({ user: req.params.id });

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
