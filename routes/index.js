const express = require('express'); 
const router = express.Router();
const fs = require('fs');
const parser = require('csv-parser');
const jsonTocsv = require('json2csv')
const path = require('path');

let comb = [];
let magazines = [];
let books = [];
let authors = [];
let searchRes = [];
let searchResStatus = ""

//compare function to sort all books and magazines by titles
const compare = (a, b) => {
    let s1 = a.title
    let s2 = b.title
    return s1.toLowerCase() > s2.toLowerCase() ? 1 : -1;
}

// for home page , combine books and magazine data and sort
async function getAllBooksMags() {
    comb = books.concat(magazines)
    comb.sort(compare)
}

// route to home page
router.get('/', function (req, res) {
    getAllBooksMags()
    console.log(comb)
    res.render('home', {
        title: "RaftLabs",
        booksMag: comb,
        searchRes: searchRes,
        searchResStatus: searchResStatus
    });
    // resetting searchres and resstatus after search done
    searchResStatus = "";
    searchRes = [];
});

// search all books and magazine by author's email
router.post('/search', function (req, res) {
    temp = comb.filter(function (item) {
        const authorArr = item.authors.split(",");
        return authorArr.find((result) => { return result == req.body.email })
    });
    searchRes = temp.length != 0 ? temp : searchRes;
    searchResStatus = temp.length == 0 ? "Not found" : "Found";
    return res.redirect('/')
});

// For Books
//Books main page
router.get('/books', function (req, res) {
    res.render('books', {
        title: "RaftLabs | Books",
        books: books,
        searchRes: searchRes,
        searchResStatus: searchResStatus
    });
    searchResStatus = "";
    searchRes = [];
});

//search books by ISBN code
router.post('/books/search', function (req, res) {
    // console.log(req.body.isbn);
    temp = books.filter(item => item.isbn == req.body.isbn);
    searchRes = temp.length != 0 ? temp : searchRes;
    searchResStatus = temp.length == 0 ? "Not found" : "Found";
    return res.redirect('/books')
});

//add a book
router.post('/books/add', function (req, res) {
    books.push(req.body);
    makeCSV(books,'books')
    return res.redirect('/books')
});

//donwload updated books csv file
router.get('/books/export', function (req, res) {
    const file = path.join(__dirname, '../data/export_csv/books.csv');
    res.download(file);
});

// For Magazines 
router.get('/magazines', function (req, res) {
    res.render('magazines', {
        title: "RaftLabs | Magazines",
        mags: magazines,
        searchRes: searchRes,
        searchResStatus: searchResStatus
    });
    searchResStatus = "";
    searchRes = [];
});

//search a magazine by isbn code
router.post('/magazines/search', function (req, res) {
    temp = magazines.filter(item => item.isbn == req.body.isbn);
    searchRes = temp.length != 0 ? temp : searchRes;
    searchResStatus = temp.length == 0 ? "Not found" : "Found";
    return res.redirect('/magazines')
});

//add a magazine
router.post('/magazines/add', function (req, res) {
    magazines.push(req.body);
    makeCSV(magazines,'magazines')
    return res.redirect('/magazines')
});

//download magazine
router.get('/magazines/export', function (req, res) {
    const file = path.join(__dirname, '../data/export_csv/magazines.csv');
    res.download(file);
});

//Authors 
router.get('/authors', function (req, res) {
    res.render('authors', {
        title: "RaftLabs | authors",
        authors: authors,
        searchRes: searchRes,
        searchResStatus: searchResStatus
    });
    searchResStatus = "";
    searchRes = [];
});

//search author by email
router.post('/authors/search', function (req, res) {
    temp = authors.filter(item => item.email == req.body.email);
    searchRes = temp.length != 0 ? temp : searchRes;
    searchResStatus = temp.length == 0 ? "Not found" : "Found";
    return res.redirect('/authors')
});

//add an author
router.post('/authors/add', function (req, res) {
    authors.push(req.body);
    makeCSV(authors,'authors')
    return res.redirect('/authors')
});

//download author file
router.get('/authors/export', function (req, res) {
    const file = path.join(__dirname, '../data/export_csv/authors.csv');
    res.download(file);
});

//fetch provided csv files and parse them into json array usng csv-parser
async function getData() {
    let bookdata = [];
    await fs.createReadStream('./data/csv_data/books.csv')
        .pipe(parser({ separator: ';' }))
        .on('data', (data) => bookdata.push(data))
        .on('end', function () {
            books = bookdata;
        })
    let magazinedata = [];
    await fs.createReadStream('./data/csv_data/magazines.csv')
        .pipe(parser({ separator: ';' }))
        .on('data', (data) => magazinedata.push(data))
        .on('end', function () {
            magazines = magazinedata;
        })
    let authordata = [];
    await fs.createReadStream('./data/csv_data/authors.csv')
        .pipe(parser({ separator: ';' }))
        .on('data', (data) => authordata.push(data))
        .on('end', function () {
            authors = authordata;
        })
}

//Function to update exported csv file after a new book is added, and also making updated csv available for downloading
async function makeCSV(jsonArr, jsonType) {
    const json2csvParser = new jsonTocsv.Parser();
    const csv = json2csvParser.parse(jsonArr);
    await fs.writeFile(path.join(__dirname, `../data/export_csv/${jsonType}.csv`), csv, function (err) {
        if (err) {
            throw err;
        }
    });
}

getData();
module.exports = router;
