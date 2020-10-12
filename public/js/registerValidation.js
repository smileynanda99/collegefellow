const colleges = {
    "MNITJaipur":"mnit.ac.in",
    "IIITDMJabalpur":"iiitdmj.ac.in"
}

$('#username').on('change', function() {
    const username = this.value;
    const RegEx = /^([a-z0-9\._]+)$/;
    if(RegEx.test(username)){
        $('#usernameError').html("Valid username").css("color", "rgb(38, 173, 38)"); 
        $.post('./userAvailable', { data: username },(res)=>{
            console.log("res: ",res);
            if(res>0){
                $('#usernameError').html("username is already taken.").css("color", "red"); 
            }else{
                $('#usernameError').html("username is Available.").css("color", "rgb(38, 173, 38)"); 
            }
        });
    }else{
        $('#usernameError').html("Invalid username").css("color", "red"); 
    }
});



$('#collegeEmail').on('change', function() {
    if($('#collegeName').val()=="Choose college"){
        $('#emailError').html("First select college").css("color", "red");  
    }else{
      const collegeName = $('#collegeName').val().replace(/\s+/g, ''); 
      const collegeEmail = $('#collegeEmail').val();
      
      if(collegeEmail.split('@')[1]!=colleges[collegeName]){
        $('#emailError').html("This Email is not of your college").css("color", "red"); 
      }else{
        $('#emailError').html("Make sure Email is exist.").css("color", "black");   
      }
    }  
});



$('#collegeName').on('change', function() {
    if($('#collegeName').val()!="Choose college" && $('#emailError').html()=="First select college"){
        $('#emailError').html("Your Email id Must be of college.").css("color", "black"); 
        const collegeName = $('#collegeName').val().replace(/\s+/g, ''); 
        const collegeEmail = $('#collegeEmail').val();
        if(collegeEmail.split('@')[1]!=colleges[collegeName] ){
            $('#emailError').html("This Email is not of your college").css("color", "red"); 
        }else{
            $('#emailError').html("Make sure Email is exist.").css("color", "black");    
        }
    }
    else if($('#collegeName').val()!="Choose college"){
        const collegeName = $('#collegeName').val().replace(/\s+/g, ''); 
        const collegeEmail = $('#collegeEmail').val();
        
        if(collegeEmail.split('@')[1]!=colleges[collegeName] && collegeEmail.length!=0){
            $('#emailError').html("This Email is not of your college").css("color", "red"); 
        }else if(collegeEmail.split('@')[1]==colleges[collegeName] && collegeEmail.length!=0){
            $('#emailError').html("Make sure Email is exist.").css("color", "black");   
        }
    }else if($('#collegeName').val()=="Choose college"){
        $('#emailError').html("First select college").css("color", "red");  
    } 
});




$('#registerBtn').on('click',function(event){

    if($('#username').val()==='' ||$('#collegeEmail').val()==='' ||$('#password').val()===''){
        event.preventDefault();
        $('#message').text("Please enter all Imformative  required field.").css("display","block");; 
    }else{
        if($('#usernameError').html()=="Invalid username"){
            event.preventDefault();
            alert("username is Invalid.\nUsernames can only contain (a-z),(0-9),( . )and( _ )."); 
        }else if($('#usernameError').html()=="username is already taken."){
            event.preventDefault();
            $('#message').text("username is already taken.").css("display","block");; 
        }else if($('#collegeName').val()==="Choose college"){
            event.preventDefault();
            $('#message').text("Please select Your college name.").css("display","block");; 
        }else if($('#emailError').html()=="This Email is not of your college"){
            event.preventDefault();
            $('#message').text("Please select Your college Official Email.").css("display","block");; 
        }else if($('#password').val().length<6){
            event.preventDefault();
            $('#message').text('Password must be at least 6 characters').css("display","block");; 
        } 
        }
});
    