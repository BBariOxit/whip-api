// const express = require('express')
import express from 'express'

const app = express()
const hostname = 'localhost'
const port = 2008

app.get('/', function (req, res) {
  res.send('<h1>hello world</h1>')
})

app.listen(port, hostname, () => {
  console.log(`hello PhanBao, i'm running server at http://${hostname}:${port}/`)
})