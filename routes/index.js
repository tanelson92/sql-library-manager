var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
const { Op } = require('sequelize');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      console.log(error);
      next(error);
    }
  }
}

/* Redirect to Books */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books/page/1');
}));

//Show all Books
router.get('/books/page/:page', asyncHandler(async (req, res) => {
  let page = req.params.page;
  const books = await getAllBooks(page);
  const total = await totalPages();
  res.render('index', { title: 'Books', books, pages: total, currPage: page });
}));

//Show "create new book" form
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { title: "New Book" });
}));

//"Create new Book"
router.post('/books/new', asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect(`/books/page/1`);
    } catch(error) {

        //Error: Missing title and/or author - Re-render new book page with errors.
        if (error.name === "SequelizeValidationError") {
          book = await Book.build(req.body);
          res.render('new-book', { book, errors: error.errors, title: "New Book" });
        } else {
          throw error;
        }

    }
}));

//Show book detail for specific book
router.get('/books/:id', asyncHandler(async (req, res) => {
  let book = await Book.findByPk(req.params.id);
  res.render('book-detail', { title: 'Book Detail', book });
}));

//Update book details for specific book
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect(`/books/page/1`);
    } else {
      res.sendStatus(404);
    }
  } catch(error) {

    //Error: Missing Title and/or Author - Re-render book-detail page with errors.
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // Id does not exist for temp build record so add it.
      res.render('book-detail', { title: 'Book Detail', book, errors: error.errors });
    } else {
      throw error;
    }

  }
}));

//Delete Confirmation Page
router.get('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('delete', { title: 'Delete Book', book });
  } else {
    res.redirect(`/books/page/1`);
  }
}));

//Delete book
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect('/books/page/1');
    } else {
      res.sendStatus(404);
    }
}));

//Search for a book...
router.get('/search/:query', asyncHandler(async (req, res) => {
  const book = await Book.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${req.params.query}%` } },
        { author: { [Op.like]: `%${req.params.query}%` } },
        { genre: { [Op.like]: `%${req.params.query}%` } },
        { year: { [Op.like]: `%${req.params.query}%` } },
      ]
    }
  });
  if (book && book.length > 0) {
    res.render('index', { title: 'Books', books: book });
  } else {
    //No Results: Show index and "no results" message for search.
    const books = getAllBooks(1);
    const total = await totalPages();
    res.render('index', { title: 'Books', search: req.params.query, books, pages: total });
  }
}));

const getAllBooks = async (page) => {
  //Show latest added books. 
  let off = 0 ? page <= 1 : (10 * page) - 10;
  const books = await Book.findAll({
    order: [
      ["id", "DESC"]
    ],
    limit: 10,
    offset: off //offset by 10 for each page when NOT on page 1. 
  });
  return books;
}

const totalPages = async () => {
  const books = await Book.findAll({
    order: [
      ["id", "DESC"]
    ],
  });
  // console.log('total books: ' + books.length);
  let temp = [];
  let totalPages = Math.ceil(books.length / 10);
  for (let i = 1; i <= totalPages; i++) {
    temp.push(i);
  }
  return temp;
}

module.exports = router;