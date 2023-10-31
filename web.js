
const url_input = document.getElementById("url_input");
const summarize_button = document.getElementById("my_button");
const download_button = document.getElementById("download_button");
const percent_dropdown = document.getElementById('percent-dropdown');
const choice_dropdown = document.getElementById('summary-dropdown');

const youtube_div = document.getElementById("youtube");
const text_out_main_div = document.getElementById("text_out_main");
const re_summarize_element = document.getElementById('re_summarize');


summarize_button.addEventListener("click", initializeSummary);

download_button.addEventListener("click", downloadScript);

const download_info = {script: "", video_id: "", video_percent: "", video_algo: ""}


summarize_button.disabled = true;

re_summarize_element.style.display = "none";


percent_dropdown.addEventListener("change", buttonUpdate);
choice_dropdown.addEventListener("change", buttonUpdate);
url_input.addEventListener("input", buttonUpdate);

function buttonUpdate() {
  
    summarize_button.disabled = (percent_dropdown.selectedIndex <= 0 || choice_dropdown.selectedIndex <= 0 || url_input.value.length <= 0);
}

function initializeSummary() {
  
    if (percent_dropdown.selectedIndex > 0 || choice_dropdown.selectedIndex > 0 || url_input.value.length > 0) {

        const text_out_content_element = document.getElementById("text-out");
        const process_element = document.getElementById("current_process");

       
        let percent_value = percent_dropdown.options[percent_dropdown.selectedIndex].text;
        let choice_index = choice_dropdown.selectedIndex;

       
        const url = url_input.value;

        const video_id = parse_youtube_video_id(url);
        const percent = percent_value.split("%")[0];
        const choice = parse_choice(choice_index);

        if (video_id) {
         
            youtube_div.style.display = "none";
            text_out_main_div.style.display = "block";

         
            fetch("https://ytsum.herokuapp.com/summarize/?id=" + video_id +
                "&percent=" + percent + "&choice=" + choice)
                .then(response => response.json()).then(result => {
              
                process_element.innerHTML = result.message;
                if (result.success) {
                    
                    const response_json = (result.response);

                   
                    text_out_content_element.innerHTML = "<b>Processed Summary:</b> " + response_json.processed_summary
                        + "<p>In your video, there are <b>" + response_json.length_original + "</b> characters in <b>" + response_json.sentence_original + "</b> sentences."
                        + "<br>The processed summary has <b>" + response_json.length_summary + "</b> characters in <b>" + response_json.sentence_summary + "</b> sentences."
                        + "</br><br>";

                    
                    download_info.script = response_json.processed_summary
                    download_info.video_id = video_id
                    download_info.video_algo = choice.replaceAll('-', '_')
                    download_info.video_percent = percent
                   
                    download_button.style.display = "block";
                   
                    text_out_content_element.style.textAlign = "justify";
                    text_out_content_element.style.textJustify = "inter-word";
                    
                    re_summarize_element.style.display = "block";
                } else {
                    
                    text_out_content_element.innerHTML = "We failed due to above reason.";
                    text_out_content_element.style.textAlign = "center";
                    
                    re_summarize_element.style.display = "block";
                }
            }).catch(error => {
                
                console.log(error);
                process_element.innerHTML = "A network issue was encountered. Please retry.";
               
                text_out_content_element.innerHTML = "We failed due to above reason.";
                text_out_content_element.style.textAlign = "center";
               
                re_summarize_element.style.display = "block";
            })
        } else {
           
            alert("Your YouTube video URL is invalid. Please retry.");
            url_input.value = "";
        }
    }
}

function parse_youtube_video_id(url) {
  
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function parse_choice(choice_index) {
   
    switch (choice_index) {
        case 1:
            return "gensim-sum";
        case 2:
            return "nltk-sum";
        case 3:
            return "spacy-sum";
        case 4:
            return "sumy-lsa-sum"
        case 5:
            return "sumy-luhn-sum";
        case 6:
            return "sumy-text-rank-sum";
    }
}

function downloadScript() {
   
    var element = document.createElement('a');
   
    element.setAttribute('href', 'data:application/octet-stream; data:text/plain;charset=utf-8,' +
        encodeURIComponent(download_info.script));
    
    element.setAttribute('download', "script_" +
        download_info.video_id + "_" + download_info.video_algo + "_" + download_info.video_percent + ".txt");
  
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}
