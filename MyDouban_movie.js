// ==UserScript==
// @name           MyDouban_movie
// @namespace      https://github.com/heawercher/userscript
// @description    Make it easier
// @author         Che.
// @version        0.1
// @include        http://movie.douban.com/subject/*
// @grunt          none
// ==/UserScript==


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

function getDoc(url, callback, data, a, b, c) {
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
      callback(doc, a, b, c);
    }
  });
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

//q网页标题
var title = document.title
title = title.split("(")[0].trim()
var title_ori = '';
//$.get("https://www.baidu.com", function(data, status) {console.log(data + "|" + status)})
// title_ori
{
  url = $("[href^='http://www.imdb.com/title/']").attr("href")
  getDoc(url, function(doc) {
    //<span class="itemprop" itemprop="name">The Little Prince</span>
    title_ori = $($(doc).find("span[class='itemprop']")[0]).text();
    console.log(title_ori)
    addMore()
    if (title_ori !== "") {
      title_ori = title

    }

  })
}


//
function addMore() {
  var table1 = $("<div>").attr("id", "link_table").append("<span class=\"pl\">下载链接:</span>")
  var table2 = $("<div>").attr("id", "download_table").append("<span class=\"pl\">资源链接:</span>")
  $("#info").append(table1).append(table2)

  var download_table = [{
    name: "龙部落",
    href: "http://www.lbldy.com/search/" + title,
    len: function(doc) {
      return $(doc).find("[id^='post-']").length
    }
  }, {
    name: "mp4ba",
    href: "http://www.mp4ba.com/search.php?keyword=" + title,
    len: function(doc) {
      return $(doc).find("h2.title").text().match(/\d+/g)
    }
  }, {
    name: "kickass",
    href: "https://kat.cr/usearch/ category:movies " + title_ori,
    len: function(doc) {
      return $(doc).find("#mainSearchTable table tbody tr").find("a[data-download]").length
    }
  }, {
    name: "edmag",
    href: "http://edmag.net/search-" + title + ".html",
    len: function(doc) {
      return $(doc).find("a[href^='/detail-']").length
    }
  }]

  for (var i = 0; i < download_table.length; i++) {
    function fu(doc, a, b, c) {
      len = a(doc)
      hr = b
      na = c
      var item = $("<a>").html(na + '(' + len + ')').attr({
        href: hr,
        target: "_blank"
      })
      $("#download_table").append(item)
      $("#download_table").append(" / ")
    }
    getDoc(download_table[i]['href'], fu, false, download_table[i]['len'], download_table[i]['href'], download_table[i]['name'])
  }

  //直接加链接
  var link_table = [{
    html: "Google_直接搜",
    href: "https://www.google.com/search?ie=UTF-8&q=" + title
  }, {
    html: "Google_百度盘",
    href: "https://www.google.com/search?q=" + title + " site:pan.baidu.com"
  }, {
    html: "VeryCD",
    href: "http://www.verycd.com/search/folders/" + title
  }, {
    html: "Donkey4u",
    href: "http://donkey4u.com/search/" + title
  }, {
    html: "Torrent Project",
    href: "http://torrentproject.com/?&btnG=Torrent+Search&num=20&start=0&s=" + title
  }, ];

  link_table.forEach(
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
    })

  function showAll() {
    items = $("#link_table").find("a")
    for (var i = 0; i < items.length; i++) {
      $(items[i]).fadeIn(3000)
    }
  }
  showAll()

}

function dc_ready(event) {
  console.log("Che.")
}
$(document).ready(dc_ready);
