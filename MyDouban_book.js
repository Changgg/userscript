// ==UserScript==
// @name           MyDouban_book
// @namespace      https://HeawerCher
// @description
// @author         Che.
// @version        0.1
// @include        http://book.douban.com/subject/*
// @grunt          none
// ==/UserScript==

//去网页标题
var title = document.title
title = title.split("(")[0].trim()
var title_ori = '';
getOriTitle()
  //工具类函数
function unique(data) {
  data = data || [];
  var a = {};
  for (var i = 0; i < data.length; i++) {
    var v = data[i];
    if (typeof(a[v]) == 'undefined') {
      a[v] = 1;
    }
  };
  data.length = 0;
  for (var i in a) {
    data[data.length] = i;
  }
  return data;
}

function getDoc(url, callback, data) {
  GM_xmlhttpRequest({
    method: data ? 'POST' : 'GET',
    url: url,
    headers: {
      'User-agent': window.navigator.userAgent,
      'Content-type': (data) ? 'application/x-www-form-urlencoded' : null
    },
    onload: function(responseDetail) {
      var doc = '';
      if (responseDetail.status == 200) {
        // For Firefox, Chrome 30+ Supported
        doc = new DOMParser().parseFromString(responseDetail.responseText, 'text/html');

        if (doc == undefined) {
          doc = document.implementation.createHTMLDocument("");
          doc.querySelector('html').innerHTML = responseText;
        }
      }
      callback(doc);
    }
  });
}

function getOriTitle() {

  if ($("#info").text().indexOf('原作名:') == -1) {
    title_ori = ""
    return
  }

  var items = $("#info").html().split("<br>")

  items.forEach(
    function(item, i) {
      if ($(item).text().trim() == "原作名:") {
        var tmp = item.trim().split(">")
        title_ori = tmp[tmp.length - 1];
      }



    })
}

//界面清理
function cleaner() {
  //$("#s_btn_wr").remove()
  $("#content > div > div.aside > div.get_douban_app").remove()
  $("#footer").remove()
  $("[href='http://www.douban.com/doubanapp/app?channel=top-nav']").remove()
  $("div.section-ebooks").remove()
    //ad
  $("#dale_book_subject_middle_right").remove()
  $("#dale_book_subject_top_right").remove()
  $("#dale_book_subject_bottom_super_banner").remove()
}
cleaner()

var table1 = $("<div>").attr("id", "link_table").append("<span class=\"pl\">搜索链接:</span>")
var table2 = $("<div>").attr("id", "download_table").append("<span class=\"pl\">资源链接:</span>")
$("#info").append(table1).append(table2)

//kickass

if (title_ori !== ""){
  kickass_ = "https://kat.cr/usearch/category:books " + title_ori
  getDoc(kickass_,kickasssearch_c)
}


function kickasssearch_c(doc) {
  len = $(doc).find("#mainSearchTable table tbody tr").find("a[data-download]").length
    //  $("#mainSearchTable table tbody tr").find("a[data-nop]")
  var item = $("<a>").html('kickass(' + len + ')').attr({
    href: kickass_,
    target: "_blank"
  })
  $("#download_table").append(item)
  $("#download_table").append(" / ")
}

//取mlook 信息
getDoc("https://www.mlook.mobi/search?q=" + title, mlook_search_c)

function mlook_search_c(doc) {
  var books = $(doc).find(".books .book div.meta h3 a[href]")
  var len = books.length
  if (len !== 0) {
    var li = new Array(len)
    for (var i = 0; i < len; i++) {
      var href = $(books[i]).attr("href");
      li[i] = href.split("#")[0]
    }
    books = unique(li)
  } else {
    books = []
  }


  if (books.length == 1) {
    var item = $("<a>").html('mLook.mobi').attr({
      href: absurl = 'https://www.mlook.mobi' + books[0],
      target: "_blank"
    })
    $("#download_table").append(item)
  } else {
    var item = $("<a>").html('mLook.mobi(' + books.length + ')').attr({
      href: absurl = "https://www.mlook.mobi/search?q=" + title,
      target: "_blank"
    })

    $("#download_table").append(item)
  }
  $("#download_table").append(" / ")


}

//读远

getDoc("http://readcolor.com/books/search?s=" + title, readcolor_search_c)

function readcolor_search_c(doc) {
  var books = $(doc).find("a.book")

  if (books.length == 1) {
    var item = $("<a>").html('读远').attr({
      href: $(books[0]).attr("href"),
      target: "_blank"
    })

    $("#download_table").append(item)
  } else {
    var item = $("<a>").html('读远(' + books.length + ')').attr({
      href: "http://readcolor.com/books/search?s=" + title,
      target: "_blank"
    })

    $("#download_table").append(item)
  }
  $("#download_table").append(" / ")
}

//直接加链接
var links = [{
  html: "Google_直接搜",
  href: "https://www.google.com/search?ie=UTF-8&q=" + title
}, {
  html: "Google_百度盘",
  href: "https://www.google.com/search?q=" + title + " site:pan.baidu.com"
}, {
  html: "VeryCD",
  href: "http://www.verycd.com/search/folders/" + title
}, {
  html: "SimpleCD",
  href: "http://simplecd.me/search/entry/?query=" + title
}, {
  html: "Donkey4u",
  href: "http://donkey4u.com/search/" + title
}, {
  html: "Torrent Project",
  href: "http://torrentproject.com/?&btnG=Torrent+Search&num=20&start=0&s=" + title
}, ];
links.forEach(
  function(item, i) {
    var item = $("<a>")
      .html(item.html)
      .attr({
        href: item.href,
        target: "_blank",
        style: "display:none;"
      })


    $("#link_table").append(item)

    $("#link_table").append(" / ");
  });

function showAll() {
  items = $("#link_table").find("a")
  for (var i = 0; i < items.length; i++) {
    $(items[i]).fadeIn(3000)
  }
}
showAll()

//  加入网页
//  $("#buyinfo-ebook").attr("id", 'info-ebook')
//  $("#info-ebook").find(".ebook-tag").remove()
//  $("#info-ebook").find("ul li").html("")
//  len = mlook_li.length
//  if (len >= 3){
//    len = 3
//  }
//  var item = $("<a>")
//  for (i = 0; i < len; i++) {
//    absurl = 'https://www.mlook.mobi' + mlook_li[i]
//    item = $("<a>").attr({
//      href: absurl,
//      target: "_blank"
//    }).html("<span class=\"\">"+title+"</span>" + "<span class=\"buylink-price\"><span class=\"\">mlook</span></span>" )
//    $("#info-ebook").find("ul li").append(item)
function dc_ready(event) {
  console.log("Che.")
}
$(document).ready(dc_ready);
