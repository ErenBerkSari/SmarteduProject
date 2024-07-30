const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      user: req.session.userID,
    });
    req.flash('success', `${course.name} has been created succesfully`);
    res.status(201).redirect('/courses');
  } catch (error) {
    req.flash('error', `Something happened!`);
    res.status(400).redirect('/courses');
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const categorySlug = req.query.categories;
    const query = req.query.search;
    let filter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        filter = { category: category._id };
      } else {
        // Kategori bulunamazsa boş sonuç döndürür
        return res.status(200).render('courses', {
          courses: [],
          categories: await Category.find(),
          page_name: 'courses',
        });
      }
    }

    if (query) {
      filter = { name: query };
    }

    if (!query && !categorySlug) {
      filter.name = '';
      filter.category = null;
    }

    const courses = await Course.find({
      $or: [
        { name: { $regex: '.*' + filter.name + '.*', $options: 'i' } },
        { category: filter.category },
      ],
    })
      .sort('-createdAt')
      .populate('user');
    const categories = await Category.find();

    res.status(200).render('courses', {
      courses,
      categories,
      page_name: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Course.findOne({ slug: req.params.slug }).populate(
      'user'
    );
    const categories = await Category.find();

    res.status(200).render('course', {
      course,
      page_name: 'courses',
      user,
      categories,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    // Oturumdaki kullanıcı kimliğini kontrol edelim
    if (!req.session.userID) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }

    // Kullanıcıyı bulalım
    const user = await User.findById(req.session.userID);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Kursu ekleyelim ve kullanıcıyı kaydedelim
    user.courses.push(req.body.course_id); // _id kullanılmasına gerek yok, sadece course_id yeterli
    await user.save();

    // Başarılı olursa yönlendirelim
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    // Hata durumunda daha ayrıntılı bilgi verelim
    console.log(error); // Hata ayıklamak için konsola yazdıralım
    res.status(400).json({
      status: 'fail',
      error: error.message || error,
    });
  }
};
exports.releaseCourse = async (req, res) => {
  try {
    // Oturumdaki kullanıcı kimliğini kontrol edelim
    if (!req.session.userID) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }

    // Kullanıcıyı bulalım
    const user = await User.findById(req.session.userID);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.courses.pull(req.body.course_id); // _id kullanılmasına gerek yok, sadece course_id yeterli
    await user.save();

    // Başarılı olursa yönlendirelim
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    // Hata durumunda daha ayrıntılı bilgi verelim
    console.log(error); // Hata ayıklamak için konsola yazdıralım
    res.status(400).json({
      status: 'fail',
      error: error.message || error,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ slug: req.params.slug });

    req.flash('error', `${course.name} has been removed successfully`);

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    course.name = req.body.name;
    course.description = req.body.description;
    course.category = req.body.category;
    course.save();

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
