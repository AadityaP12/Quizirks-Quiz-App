console.log("JS file loaded");





const quizState={

  score:0,
  currentquestionindex:0,
  userAnswers:[],
};

let timeLeft=3600; //question not loading bug here when changing time
let timer;
let quizData=[];


document.addEventListener("DOMContentLoaded",()=>{

  const savedState=getState();
  if(savedState){

    
    loadIndices();
  }

  welcomePage();

})



function welcomePage(){

  document.getElementById("timer").innerHTML="";  

  const welcome=document.getElementById("welcome-page");
  welcome.className="welcome";

  const attempt=document.createElement("button");
  attempt.id="attempt-btn";
  attempt.innerText="Attempt";
  attempt.addEventListener("click",async function(){

   
    await fetchQuizData();  
    loadNewMainPage();
     
  })

  welcome.appendChild(attempt);

}

function loadNewMainPage(){

  loadIndices(); 
  startTimer();
  trackQuestion();  
  loadQuizBox(); 


}

async function fetchQuizData(){

  

try {

  document.querySelector(".spinner").style.display="flex";  

  const res= await fetch("https://opentdb.com/api.php?amount=50&category=18");

  /*let loadingTime=0;

  setInterval(()=>{

    loadingTime++;

    if(loadingTime>10){

      throw new Error(loadErrorMessage())
    }

  },1000);*/

  const data= await res.json();

  quizData=data.results.map(item => {


    //const question=item.question;
    const allOptions=[...item.incorrect_answers,item.correct_answer];

    const shuffleOptions= allOptions.sort(()=>{

      return Math.random() - 0.5;
    });

    const correctIndex=shuffleOptions.indexOf(item.correct_answer);

    document.querySelector(".spinner").style.display="flex";  

    return{

      question: decodeHTML(item.question),
      options: shuffleOptions.map(decodeHTML),

      //options: allOptions.map(text => decodeHTML(text)), //       can also write it like this

      correct: correctIndex
    }

    


  })
  
} catch (error) {

  console.error("Failed to load quiz: ",error);
  
  loadErrorMessage();
  
}
}

function loadErrorMessage(){

  document.body.classList.add("error-message");

  document.body.innerHTML=`<h3><p>Sorry, couldn't load questions. Please try again later.<p><h3>`;

  const retryBtn=document.createElement("button");
  retryBtn.id="retry-btn";
  retryBtn.style.display="flex";
  retryBtn.innerText="Retry";
  retryBtn.addEventListener("click",async ()=>{

    document.querySelector(".spinner").style.display="flex";    /// loading indicator not showing

    try {

      await fetchQuizData();
      loadIndices();
      startTimer();
      trackQuestion();
      loadQuizBox();
    
      
    } catch (error) {

      loadErrorMessage();
      
    }
  })

  document.body.appendChild(retryBtn);
}


function decodeHTML(text){

  const txt=document.createElement('textarea');

  txt.innerHTML=text;

  return txt.value;

}



function loadIndices(){

  
  const inbox=document.getElementById("inbox");
  inbox.style.display="flex";  

  const questionBox=document.getElementById("question-box");
  questionBox.innerHTML="";
  questionBox.style.display="flex";
  //questionBox.style.gap="2.5rem";
  

  quizData.forEach(function(_,i){

    const quenum=document.createElement("button");
    quenum.className="quenum";
    quenum.innerText=i+1;
    
    
    quenum.addEventListener("click",()=>{
      quizState.currentquestionindex=i;
      
      trackQuestion();
      
      loadQuizBox();
    })

    questionBox.appendChild(quenum);



  })

  

}

function trackQuestion(){

  const allQuestions=document.querySelectorAll(".quenum");
  
  allQuestions.forEach((btn,i)=>{

    if(i===quizState.currentquestionindex){
      document.getElementById("active").textContent=`Question ${i+1} of ${quizData.length} `;

      btn.classList.add("active-question");
      
      console.log(`question ${quizState.currentquestionindex+1} is active`)
    } else{
      btn.classList.remove("active-question"); 
    }
  })
  
}

 function startTimer(){


    document.querySelector(".spinner").style.display="none";  // why transferring this here makes the loader disappear?

  
    clearInterval(timer);

    displayTimer();
    
 
    timer=setInterval(()=>{

      timeLeft--;

      displayTimer();
    
      console.log("time is running")
    
      if(timeLeft===0){
        clearInterval(timer);
        finishQuizAutomatically();
      }

    },1000);


 }

 function displayTimer(){

  const displogo=document.getElementById("upper-wrapper");

  displogo.style.display="flex";
  
  const timerElt=document.getElementById("timer");

  timerElt.style.display="flex";

    let seconds=timeLeft%60;
    console.log(seconds);
    let minutes=Math.floor((timeLeft%3600)/60);
    console.log(minutes);
    let hours=Math.floor(timeLeft/3600);
    console.log(hours);

    if(hours===0 && minutes<10){

      timerElt.classList.add("alert");
      timerElt.innerHTML=`${padTimer(hours)}:${padTimer(minutes)}:${padTimer(seconds)}`;
     


    } else{

      timerElt.classList.remove("alert");
      timerElt.innerHTML=`${padZeroes(hours)}:${padZeroes(minutes)}:${padZeroes(seconds)}`;
    }



 }

 function padZeroes(time){

  console.log("type of time: ",typeof time);

  if(time<10){

    return String(time).padStart(2,"0");
    
  }
  else{ 
    return time;
  }

 }


function loadQuizBox(){

  

  //document.querySelector("#quiz-box").style.display="block";  can also use querySelector for access
  
  document.getElementById("quiz-box").style.display="flex";
  
  
  removeWelcomePage();

  const existresult=document.getElementById("result");
  existresult.innerText="";

  trackQuestion();  

  loadQuestion(); 
  
  AppendNavigation();
 
}


function loadQuestion(){

  const currentQuestion=quizData[quizState.currentquestionindex];
  
  const quecontainer=document.getElementById("question");

  quecontainer.innerText=currentQuestion.question;

  const optionscontainer=document.getElementById("options");
  optionscontainer.innerHTML="";

  currentQuestion.options.forEach((optionText,i)=>{         //display each option

    const label=document.createElement("label");
    label.className="label-options";
    label.style.display="flex";
    optionscontainer.style.display="block";
    const radio=document.createElement("input");
    
    radio.className="radio-button";      // using radio buttons for displaying options
    radio.type="radio";
    radio.name="option";
    radio.value=i;
    radio.style.display="flex";
    radio.addEventListener("change",()=>{
      
      saveAnswer(parseInt(i));
    })

    label.appendChild(radio);
    label.appendChild(document.createTextNode(optionText));
    optionscontainer.appendChild(label);

    if(quizState.userAnswers[quizState.currentquestionindex]===i){
      radio.checked=true; 
    }
    
  })

}

function saveAnswer(i){

  console.log('save answer triggered.')
  
  const queIndex=quizState.currentquestionindex;

  //assigning the option index to an user answers array with index having question index
  quizState.userAnswers[queIndex]=i; 
  storeState();
  
}

function AppendNavigation(){

  clearElementById("clear-btn");

  clearElementById("nxt-btn");

  clearElementById("prev-btn");

  clearElementById("finish-btn");

  AppendClearBtn();


  if(quizState.currentquestionindex===0){

    //append next button only

    AppendNextBtn();
          
  } 
      
  else if(quizState.currentquestionindex<quizData.length-1){

    //append next and previous buttons

    AppendPrevBtn();
    AppendNextBtn();
    
  } else if(quizState.currentquestionindex===quizData.length-1){

    //append prev and finish buttons

    AppendPrevBtn();
    AppendFinishBtn();

  }

  
}

function removeWelcomePage(){

  const existwelcome=document.querySelector(".welcome");

  if(existwelcome){
    existwelcome.remove();
  }  

}



function clearElementById(id){

  const element=document.getElementById(id);

  if(element){

    element.remove();
  }

}



function AppendClearBtn(){

  const cleardiv=document.querySelector(".clear-container");
    
    document.querySelector(".all-buttons").insertBefore(cleardiv,document.querySelector(".nav-buttons"));
    const clear=document.createElement("button");
    clear.id="clear-btn";
    clear.innerText="Clear";
    clear.addEventListener("click",()=>{

      const radio=document.querySelectorAll(".radio-button");

      radio.forEach(radbtn => {
       if(radbtn){
        radbtn.checked=false;
       }
      })
    })

    cleardiv.appendChild(clear);

}

function AppendNextBtn(){


  const nxtbtn=document.createElement("button");
  nxtbtn.id="nxt-btn";
  nxtbtn.innerText="Next";
  nxtbtn.addEventListener("click",function(){

    quizState.currentquestionindex++;
    loadQuizBox();
  })
  
  document.querySelector(".nav-buttons").appendChild(nxtbtn);

   storeState();
          

}

function AppendPrevBtn(){


  const prevbtn=document.createElement("button");
  prevbtn.id="prev-btn";
  prevbtn.innerText="Prev";
  prevbtn.addEventListener("click", function(){
    quizState.currentquestionindex--;
    loadQuizBox();
            
  })

  document.querySelector(".nav-buttons").appendChild(prevbtn);

   storeState();

  


}

function AppendFinishBtn(){

  const finishbtn=document.createElement("button");
  finishbtn.id="finish-btn";
  finishbtn.innerText="Finish";
  finishbtn.addEventListener("click",async function(){

    document.getElementById("result").innerHTML="";
   
    //const confirmed=window.confirm("Are you sure you want to finish the quiz?");

    
    console.log("confirm status: ",confirm);

    const confirmed= await confirmFinish();

    if(confirmed){

      clearElementById("main-wrapper");

      clearElementById("timer");
    
      clearInterval(timer);          //stop the timer if user clicks finish

      validateUser();

      }
          
             
    })
    document.querySelector(".nav-buttons").appendChild(finishbtn);

     storeState();


}

async function confirmFinish(){

  console.log("inside confirmFinish function");

  clearElementById("confirm-finish");

  //document.getElementById("main-wrapper").classList.add("blur-background");

  const confirmed=document.createElement("div");
  confirmed.id="confirm-finish";
  document.body.insertBefore(confirmed,document.querySelector(".time-up"));
  confirmed.style.display="flex";

  confirmed.textContent="Are you sure you want to finish the quiz?";

  const containbtns=document.createElement("div");
  containbtns.id="contain-btns";

  confirmed.appendChild(containbtns);



  const yes=document.createElement("button");
  yes.innerText="Yes";
  yes.id="yes-btn";

  const no=document.createElement("button");
  no.innerText="No";
  no.id="no-btn";

  console.log("returning confirm status");

  return new Promise ((resolve,reject) =>{

    yes.addEventListener("click",()=>{

    confirmed.style.display="none";
    resolve(true);
    
  })                                          //return a promise for waiting for user input


  containbtns.appendChild(yes);              // add events listeners and append buttons INSIDE this promise


  no.addEventListener("click",()=>{

    confirmed.style.display="none";
    resolve(false);

  })
  containbtns.appendChild(no);

  } );

  


}



function validateUser(){

  const completedBox=document.getElementById("completed-box");
  completedBox.style.display="flex";                // display the completed box to show result
  completedBox.innerHTML=`<h2>Quiz completed!</h2><br/>`;    
  checkAnswer(); 
  completedBox.appendChild(AppendViewScoreBtn()); 
  
}

function AppendViewScoreBtn(){

  const viewscorebtn=document.createElement("button");
  viewscorebtn.innerText="View score";
  viewscorebtn.className="viewscorebtn";
  viewscorebtn.addEventListener("click",function(){
    displayScore();
  })

  return viewscorebtn;

}

function finishQuizAutomatically(){

  //const existtimer=document.getElementById("timer");
  //existtimer.remove();

  clearElementById("main-wrapper");

  clearElementById("timer");

  document.querySelector(".time-up").style.display="flex"; 

  document.querySelector(".time-up").innerHTML=`<h2>Time's up!</h2>`;

  document.querySelector(".time-up").appendChild(AppendViewScoreBtn());
  
}



function checkAnswer(){

  console.log("checkAnswer method triggered.");

  quizData.forEach((_,queindex)=>{

      if(quizState.userAnswers[queindex]===quizData[queindex].correct){
      quizState.score++;
      }
    })

  }

function displayScore(){

  console.log("display score method triggered");

  
  const timeup=document.querySelector(".time-up");

  if(timeup){
    timeup.remove();
  }
  

  document.getElementById("completed-box").style.display="flex";   
  document.getElementById("result").innerText="";
  document.getElementById("completed-box").textContent=`Your score: ${quizState.score}/${quizData.length}`;
  storeState();
}

function storeState(){

  localStorage.setItem("quizState",JSON.stringify(quizState));
}

function getState(){

  return JSON.parse(localStorage.getItem("quizState"));
}