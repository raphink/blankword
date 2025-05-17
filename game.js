$(document).ready(function() {
    let currentSeries = null;
    let verses = [];
    let currentVerseIndex = 0;
    let score = 0;
    let userAnswers = [];
    
    // Event listener for series selection
    $('#seriesList').on('click', 'a', function(e) {
        e.preventDefault();
        const seriesName = $(this).data('series');
        $('#seriesDropdown').text($(this).text());
        loadSeries(seriesName);
    });
    
    // Load a series
    function loadSeries(seriesName) {
        // Load data from the JSON file with the series name
        $.getJSON(seriesName + ".json", function(data) {
            currentSeries = data;
            verses = currentSeries.verses;
            currentVerseIndex = 0;
            score = 0;
            userAnswers = [];
            
            $('#totalQuestions, #totalQuestions2, #finalTotal').text(verses.length);
            $('#correctScore, #finalScore').text('0');
            $('#startScreen').hide();
            $('#resultsArea').hide();
            $('#gameArea').show();
            
            displayVerse();
        }).fail(function(jqxhr, textStatus, error) {
            console.error("Failed to load data.json: " + textStatus + ", " + error);
        });
    }
    
    // Display current verse
    function displayVerse() {
        if (currentVerseIndex >= verses.length) {
            showResults();
            return;
        }
        
        const verse = verses[currentVerseIndex];
        $('#currentQuestion').text(currentVerseIndex + 1);
        
        // Replace the word to blank with an actual blank
        let displayText = verse.text.replace(
            new RegExp(verse.answer, 'gi'), 
            '<span class="blank">_____</span>'
        );
        
        $('#verseText').html(displayText);
        $('#verseRef').text(verse.reference);
        
        // Create option buttons (using the answer and alternative)
        let optionsHtml = '';
        const options = [verse.answer, verse.alternative];
        
        // Shuffle the options
        options.sort(() => Math.random() - 0.5);
        
        options.forEach(option => {
            optionsHtml += `<button class="btn btn-outline-primary btn-option" data-option="${option}">${option}</button>`;
        });
        
        $('#options').html(optionsHtml);
        $('#feedback').text('').removeClass('text-success text-danger');
        
        $('#nextBtn').hide();
        $('#finishBtn').hide();
        
        // Show finish button on last question
        if (currentVerseIndex === verses.length - 1) {
            $('#finishBtn').show();
        } else {
            $('#nextBtn').show();
        }
        
        // Disable next/finish buttons until answer is selected
        $('#nextBtn, #finishBtn').prop('disabled', true);
    }
    
    // Event listener for option selection
    $(document).on('click', '.btn-option', function() {
        const selectedOption = $(this).data('option');
        const correctOption = verses[currentVerseIndex].answer;
        
        // Disable all option buttons
        $('.btn-option').prop('disabled', true);
        
        // Record the answer
        userAnswers.push({
            verse: currentVerseIndex,
            selected: selectedOption,
            correct: selectedOption.toLowerCase() === correctOption.toLowerCase()
        });
        
        // Fill in the blank with the selected option
        $('.blank').text(selectedOption);
        
        // Show feedback
        if (selectedOption.toLowerCase() === correctOption.toLowerCase()) {
            score++;
            $('#correctScore').text(score);
            $('#feedback').text('Correct!').addClass('text-success');
            $(this).removeClass('btn-outline-primary').addClass('btn-success');
        } else {
            $('#feedback').text(`Incorrect! The correct answer is "${correctOption}".`).addClass('text-danger');
            $(this).removeClass('btn-outline-primary').addClass('btn-danger');
            
            // Highlight the correct button
            $(`.btn-option[data-option="${correctOption}"]`).removeClass('btn-outline-primary').addClass('btn-success');
        }
        
        // Enable next/finish button
        $('#nextBtn, #finishBtn').prop('disabled', false);
    });
    
    // Event listener for next button
    $('#nextBtn').on('click', function() {
        currentVerseIndex++;
        displayVerse();
    });
    
    // Event listener for finish button
    $('#finishBtn').on('click', function() {
        showResults();
    });
    
    // Event listener for play again button
    $('#playAgainBtn').on('click', function() {
        $('#resultsArea').hide();
        $('#startScreen').show();
        $('#seriesDropdown').text('Select Series');
    });
    
    // Show game results
    function showResults() {
        $('#gameArea').hide();
        $('#resultsArea').show();
        
        $('#finalScore').text(score);
        const percentage = (score / verses.length) * 100;
        $('#scoreProgressBar').css('width', `${percentage}%`).attr('aria-valuenow', percentage);
        
        // Could add more detailed results here, like which ones they got right/wrong
    }
});
