const socket = io();

socket.on('connect', () => {
  socket.emit('on-refresh',{socketId:socket.id, username:getCookie('username')})
});


function onHomeLoad(){
  /* cookies */
  if(checkCookie('username')){
    $('#content').children("div:first").remove();
    $('#content').append("<div>Question load here</div>")
  }else{
    $('#content').append(`
        <div id="user-form" class="user-form">
        <input id="username" name="username" type="text" placeholder="Enter Name"/>
        <button id="userBtn" class="userBtn" type="button">SUBMIT</button>
        </div>
    `)
  }
}

$(document).ready(function () {
 onHomeLoad();
  
  $('#userBtn').click(function (e) {
    e.preventDefault();
    const username = $('#username').val();
    setCookie("username", username,30);
    socket.emit('user-details', {
      username: username,
      score: 0,
      socketId: socket.id,
    });
    $('#content').children("div:first").remove();
    $('#content').append("<div>Question load here</div>")
  });


  /* ADMIN Functionality */
  $(document).on('click', '#adminLoginBtn', function(e){
    e.preventDefault();
    const adminUsername=$('#adminUsername').val();
    const adminPassword=$('#adminPassword').val();
    if(adminUsername?.length===0 || adminPassword?.length===0){
      $('#err-msg').show()
      setTimeout(function(){$('#err-msg').hide();},1000)
    }else{
      // send admin credentials to server
      socket.emit('admin-cred',{adminPassword,adminUsername, socketId:socket.id});
    }
    // console.log(adminUsername, adminPassword);
  })

  $('#admin').click(function(e){
      e.preventDefault();
      const cookieAdmin=checkCookie('isAdminLog')
      console.log('cookieAdmin=',cookieAdmin)
      if(cookieAdmin){
        $('#content').children("div:first").remove();
        $('#content').append(`<div>Admin logged in</div>`)
      }else{
        $('#content').children("div:first").remove();
        $('#content').append(`
        <div>
            <input id="adminUsername" name="username" type="text" placeholder="Enter username"/>
            <input id="adminPassword" name="password" type="password" placeholder="Enter Password"/>
             <div id="err-msg" style="color:red;display:none">Please enter valid username or password</div>
            <button id="adminLoginBtn" class="userBtn" type="button">LOGIN</button>
        </div>
       
         `)
      }
      
  });

  socket.on('admin-verify', data=>{
    // console.log(data);
    if(data.isAdminLog){
      $('#content').children("div:first").remove();
      $('#content').append(`<div>Admin logged in</div>`)
      setCookie("isAdminLog","true",1);
    }else{
      $('#err-msg').show()
      setTimeout(function(){$('#err-msg').hide();},1000)
    }
  })
  /* END admin functionality */

  /* HOME click */
  $('#home').click(function(e){
    e.preventDefault();
    onHomeLoad();
  })

});
