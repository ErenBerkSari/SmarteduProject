const nodemailer = require('nodemailer');
const Course = require('../models/Course');
const User = require('../models/User');

exports.getIndexPage = async (req, res) => {
  const courses = await Course.find().sort('-createdAt').limit(2);
  const totalCourses = await Course.find().countDocuments();
  const totalStudents = await User.find().countDocuments({ role: 'student' });
  const totalTeacher = await User.find().countDocuments({ role: 'teacher' });

  res.status(200).render('index', {
    page_name: 'index',
    courses,
    totalCourses,
    totalStudents,
    totalTeacher,
  });
};

exports.getAboutPage = (req, res) => {
  res.status(200).render('about', {
    page_name: 'about',
  });
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render('register', {
    page_name: 'register',
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    page_name: 'login',
  });
};

exports.getContactPage = (req, res) => {
  res.status(200).render('contact', {
    page_name: 'contact',
  });
};

exports.sendEmail = async (req, res) => {
  try {
    const outputMessage = `
  <h1>Mail Details</h1>
  <ul>
    <li>Name: ${req.body.name}</li>
    <li>Email: ${req.body.email}</li>
  </ul>
  <h1>Message</h1>
  <p>${req.body.message}</p>
  `;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: 'email@gmail.com',
        pass: 'password',
      },
    });
    const info = await transporter.sendMail({
      from: '"Smart EDU Contact Form" <erenmxc@gmail.com>', // sender address
      to: 'erenmxc@gmail.com', // list of receivers
      subject: 'Smart EDU Contact Form New Message ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: outputMessage, // html body
    });

    console.log('Message sent: %s', info.messageId);

    req.flash('success', 'We Received your message succesfully');
    res.status(200).redirect('contact');
  } catch (err) {
    // req.flash('error', `Something happened! ${err}`);
    req.flash('error', `Something happened!`);
    res.status(200).redirect('contact');
  }
};
