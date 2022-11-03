$(() => {
    $('#navbar').load('../components/navbar.html');
    console.log($("content"))
    $("#content").load('../components/home.html');
  })