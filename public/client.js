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
    $('#content').children("div:first").remove();
    $('#content').append(`
        <div id="user-form" class="user-form">
        <input id="username" name="username" type="text" placeholder="Enter Name"/>
        <button id="userBtn" class="userBtn" type="submit">SUBMIT</button>
        </div>
    `)
  }
}

$(document).ready(function () {
 onHomeLoad();
  // submit username 
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
      // console.log('cookieAdmin=',cookieAdmin)
      if(cookieAdmin){
        socket.emit('get-question-list',{socketId:socket.id});
        $('#content').children("div:first").remove();
        $('#content').append(`
          <div class="admin-container">
              <div id="answerd-correct-users" class="answerd-correct-users"></div>
              <div id="question-list" class="question-list">
                
              </div>
          </div>
        `)
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

  
  $(document).on('click', '#question-list', function(e){
    // console.log(e.target.id)
    // remove question from participant
    if(e.target.id.startsWith('remove')){
      // console.log("yes")
      socket.emit('remove-question',{socketId:socket.id});
    }else if(e.target.id.startsWith('share')){
      // send question to participant
      const quesID=e.target.id.split('-')[1];
      socket.emit('broadcast-question',{id:parseInt(quesID)})
    }
  })

//  send answer of participant to server
  $(document).on('click','#myrdb',function(e){
    e.preventDefault();
    if ($(this).is(':checked')) {
      // alert($(this).val());
      $('#content').children("div:first").remove();
      
      const quesNo=parseInt($(this).attr('name'));
      const ansNo=parseInt($(this).val())
      console.log(quesNo, ansNo);
      socket.emit('answer',{quesNo:quesNo, ansNo:ansNo,username:getCookie('username')});
      $('#content').append(`<div>Question load here</div>`)
    }
  });

  // remove question
  socket.on('remove-question',data=>{
    $('#content').children("div:first").remove();
    $('#content').append(`<div>Question load here</div>`);
  })

 //  question came at client
  socket.on('question', data=>{
    const {question}=data;
    $('#content').children("div:first").remove();
    $('#content').append(`
    <div class="question">
         <p><strong>Q${question.id}</strong>: ${question.desc}</p>
         ${question.options.map((item, index)=>{ return `
             <label class="radioButtons">
               <input id="myrdb" type="radio" name="${question.id}" value="${index+1}">${item}
             </label>
         `}).join('')}  
    </div>
    `);
    console.log(question)
  })

  // check admin credential is valid or not
  socket.on('admin-verify', data=>{
    // console.log(data);
    if(data.isAdminLog){
      socket.emit('get-question-list',{socketId:socket.id});
      $('#content').children("div:first").remove();
      $('#content').append(`
        <div class="admin-container">
        <div id="answerd-correct-users" class="answerd-correct-users"></div>
        <div id="question-list" class="question-list">
          
        </div>
        </div>
      `)
      setCookie("isAdminLog","true",1);
    }else{
      $('#err-msg').show()
      setTimeout(function(){$('#err-msg').hide();},1000)
    }
  })

  // display question on admin panel
  socket.on('question-list', (data)=>{
    console.log('questions=',data)
    let questionTemplate=`<ol>`;
    const {questions}=data;
    for(let i=0;i<questions.length;i++){
      questionTemplate+=`<li>${questions[i].desc} <button id=${`share-`+questions[i].id} class="btn">SHARE</button> <button id=${`remove-`+questions[i].id} class="btn">REMOVE</button></li>`
    }
    questionTemplate+=`</ol>`
    $('#question-list').append(questionTemplate);
  })
  /* END admin functionality */

  /* HOME click */
  $('#home').click(function(e){
    e.preventDefault();
    onHomeLoad();
  })

  /* Leaderboard START */
  $('#leaderboard').click(function(e){
    socket.emit('users-score', {socketId:socket.id});
  })
  socket.on('users-score',(data)=>{
    console.log('users score at client=', data);
    const {users}=data;
    $('#content').children("div:first").remove();
      $('#content').append(
    `
    <div>
      <table id="users">
          <tr>
            <th>Username</th>
            <th>Score</th>
          </tr>
          ${users.map((item)=>`
          <tr>
            <td>${item.username}</td>
            <td>${item.score}</td>
          </tr>
          `).join('')}
      </table>
    </div>
    `
    );
  })
  /* Leaderboard END */

});
