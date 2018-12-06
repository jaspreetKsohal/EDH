// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();

    var block1 = '';
    var block2 = '';
    var block1Target = undefined;
    var block2Target = undefined;
    var isCompare = false,
        lastChanged = 2;

    //Current step for the story progress
    var storyIndex = 0;

    //about button
    $('#about').css({width: $('.filters')[0].getBoundingClientRect().width});

    // about button selected
    $('#about').on('click', function(){
        $('#about-overlay').fadeIn('slow', function() {
            $(this).removeClass('hideAbout');
            $(this).addClass('showAbout');
        });
    });

    $('#close-about').on('click', function(){
        $('#about-overlay').fadeOut('slow', function() {
            $(this).removeClass('showAbout');
            $(this).addClass('hideAbout');
        });
    });

    $('#options').append('<p id="timeline-title">2017 Crimes</p>');

    $('input[type=radio]').click(function(e){
        var selectedValue = $('input[name=radio1]:checked').val();
        if(selectedValue == 'heatmap'){
            if(!$('#heatmap-title').length){
                $('#options').append('<p id="heatmap-title">Number of Crimes: Hour vs Day and Month vs Day</p>');
            }
            $('#timeline-title').remove();
            $('.heatmapDIV').show();
            $('.timelineDIV').hide();
        }
        else {
            if(!$('#timeline-title').length){
                $('#options').append('<p id="timeline-title">2017 Crimes</p>');
            }
            $('#heatmap-title').remove();
            $('.heatmapDIV').hide();
            $('.timelineDIV').show();
        }
    });

    $('input[name=checkbox]').change(function(e){
        var arr = [];
        $('input.chkbox:checkbox:checked').each(function () {
            arr.push($(this).val());
        });

        if(view.isLayerActive('service')){
            view.removeServices();
        }
        view.addServices(model.getFilteredServices(arr));
    });


    function getServiceTypePanelHeight() {
        var height = $('#map')[0].getBoundingClientRect().height;
        return height;
    };


    $('td').on('click', function(event){

        // $('.filter-option').on('click', function(event){
        // console.log(view.isLayerActive());
        var filter = $(event.currentTarget).find(':first-child').attr('id');

        // $('#'+filter).toggleClass("highlight");
        $(event.currentTarget).toggleClass("highlight");

        if(filter === 'service'){
            $('#service-types').toggleClass('hide-services');
            $('#service-types').css({height: getServiceTypePanelHeight()});
            if(view.isLayerActive(filter)){
                view.removeServices();
            } else {
                $('.chkbox').prop('checked', true);
                view.addServices(model.getServiceData());
            }
        }//if-service
        else if(filter === 'school'){
            if(view.isLayerActive(filter)){
                view.removeSchools();
            } else {
                view.addSchools(model.getSchoolData()[0]);
            }
        }//if-school
        else if(filter === 'crime'){
            if(view.isLayerActive(filter)){
                view.removeCrimes();
            } else {
                // view.addCrimes(model.getCrimeData()[0]);
                view.addCrimes(model.getCensusData());
            }
        }//if-crime
        else if(filter === 'vacant-lot'){
            if(view.isLayerActive(filter)){
                view.removeVacantLots();
            } else {
                view.addVacantLots(model.getVacantLots());
            }
        }//if-vacant-lots
        else if(filter === 'safe-passage'){
            if(view.isLayerActive(filter)){
                view.removeSafePassages();
            } else {
                view.addSafePassages(model.getSafePassagesData());
            }
        }//if-safe-passage

    });

    $(document).on('loadCensus', function(e) {
        // total race dist from the model
        view.addCensusBlocks(model.getCensusData());
        
        view.showRaceDist(model.getTotalRaceDist(), '#block1race', "Racial Dist.: Total");
        view.showGenderAgeDist(model.getTotalGenderAgeDist(), '#block1gen', "Gender and Age: Total");
    });

    $(document).on('loadCrime', function(e) {
        console.log('crime loaded');
        view.showCrimeByCat(model.getCrimesByCat(), '#block1crime', "Crime by Type: Total");

        view.showCrimeTimeline(model.getCrimeTimeline());

        var data = model.getCrimesDayVsHours(model.getCrimeData());
        view.addCrimesByHourHeatmap(data);

        var data2 = model.getCrimesDayVsMonth(model.getCrimeData());
        view.addCrimesByMonthHeatmap(data2);

    });

    $(document).on('blockSelected', function(e, info) {
        if(isCompare) {
            if (lastChanged == 1) {
                block2 = info.blockSelected;
                //first remove the highlight
                view.removeBlockHighlight(block2Target);
                //update variable to hold new block target
                block2Target = info.target;
                lastChanged = 2;
            } else {
                block1 = info.blockSelected;
                lastChanged = 1;
                //first remove the highlight
                view.removeBlockHighlight(block1Target);
                //update variable to hold new block target
                block1Target = info.target;
            }
        } else {
            block1 = info.blockSelected;
            lastChanged = 1;
            //first remove the highlight
            view.removeBlockHighlight(block1Target);
            //update variable to hold new block target
            block1Target = info.target;
        }
        view.removeRaceDist('#block' + lastChanged + 'race');
        view.removeGenAgeDist('#block' + lastChanged + 'gen');
        view.removeCrimesByCat('#block' + lastChanged + 'crime');

        //hide the compare text
        $('#b' + lastChanged + 'CompTxt').removeClass('show')

        view.showRaceDist(model.getBlockRaceDist(info.blockSelected), '#block' + lastChanged + 'race', "Racial Dist.: Block " + info.blockSelected);
        view.showGenderAgeDist(model.getBlockGenAgeDist(info.blockSelected), '#block' + lastChanged + 'gen', "Gender and Age: Block " + info.blockSelected);
        view.showCrimeByCat(model.getCrimesByCat(info.blockSelected), '#block' + lastChanged + 'crime', "Crime By Type: Block " + info.blockSelected);

        
    });

    $(document).on('blockDeselected', function(e, info) {
        
        console.log('block1 ', block1); 
        if(isCompare) {
            if(block1 == info.blockSelected) {
                $('#b1CompTxt').addClass('show')
                view.removeRaceDist('#block1race');
                view.removeGenAgeDist('#block1gen');
                view.removeCrimesByCat('#block1crime');
                //update last changed
                lastChanged = 1;
            } else if (block2 == info.blockSelected) {
                $('#b2CompTxt').addClass('show')
                view.removeRaceDist('#block2race');
                view.removeGenAgeDist('#block2gen');
                view.removeCrimesByCat('#block2crime');
                //update last changed
                lastChanged = 2;
            }
        }
        else {
            showOverview();       
        }
        //reset the block values to ''
        if(block1 == info.blockSelected) {
            block1 = '';
        } else if (block2 == info.blockSelected) {
            block2 == '';
        }
    });

    $(document).on('dateUpdate', function(e, info) {
        // console.log(info);
        var data = model.getDateFilteredCrime(info);
        if(view.isLayerActive("crime")){
            view.removeCrimes(true);
            view.addCrimes(data, true);
        }
    });

    $("#overviewBtn").on('click', function (e) {
        //hide details for block2
        showOverview()
        
    });

    $('#compareBtn').on('click', function() {
        isCompare = !isCompare;
        if(isCompare) {
            $('#compareBtn').attr('value', 'Stop Comparing');
            //split the details for 2 blocks
            view.removeRaceDist('#block1race');
            view.removeGenAgeDist('#block1gen');
            view.removeCrimesByCat('#block1crime');
            // $('.detailblock1').addClass('compare')
            // $('.detailblock2').addClass('compare')
            $('#block1race').addClass('compare');
            $('#block1gen').addClass('compare');
            $('#block1crime').addClass('compare');
            $('#b2CompTxt').addClass('show')
            if(block1 == '') {
                $('#b1CompTxt').addClass('show')
            } else {
                view.showRaceDist(model.getBlockRaceDist(block1), '#block' + lastChanged + 'race', "Racial Dist.: Block " + block1);
                view.showGenderAgeDist(model.getBlockGenAgeDist(block1), '#block' + lastChanged + 'gen', "Gender and Age: Block " + block1);
                view.showCrimeByCat(model.getCrimesByCat(block1), '#block' + lastChanged + 'crime', "Crime By Type: Block " + block1);
            }
        }
        else {
            showOverview();
        } 
    });

    function showOverview() {
        // $('.detailblock1').removeClass('compare')
        // $('.detailblock2').removeClass('compare')
        $('#block1race').removeClass('compare');
        $('#block1gen').removeClass('compare');
        $('#block1crime').removeClass('compare');
        view.removeRaceDist('#block1race');
        view.removeGenAgeDist('#block1gen');
        view.removeCrimesByCat('#block1crime');
        view.removeRaceDist('#block2race');
        view.removeGenAgeDist('#block2gen');
        view.removeCrimesByCat('#block2crime');
        //first remove the highlight
        view.removeBlockHighlight(block2Target);
        view.removeBlockHighlight(block1Target);
        
        //update variable to hold new block target
        block2Target = undefined;
        block1Target = undefined;

        block1 = '';
        block2 = '';
        $('#compareBtn').attr('value', 'Compare Blocks');

        // var data = model.getCrimesDayVsHours(model.getBlockCrimeData(info));
        // view.addCrimesByHourHeatmap(data);

        view.showRaceDist(model.getTotalRaceDist(), '#block1race', "Racial Dist.: Total");
        view.showGenderAgeDist(model.getTotalGenderAgeDist(), '#block1gen', "Gender and Age: Total");
        view.showCrimeByCat(model.getCrimesByCat(), '#block1crime', "Crime By Type: Total");
    }

    $('#beginBtn').on('click', function () {
        console.log('begin');
        $('.landing-page').fadeOut('slow', function() {
            $('.landing-page').remove();
            $('.overlay').fadeIn( 'slow', function() {
                $('.overlay').removeClass('hidden');
                $('.overlay').addClass('show');
                view.showContentForIndex(storyIndex);
            });
        });
    });

    $('.next').on('click', function() {
        if(storyIndex == 2 || storyIndex == 5) storyIndex++;
        storyIndex++;
        view.showContentForIndex(storyIndex);
    });

    $('.prev').on('click', function() {
        storyIndex--;
        view.showContentForIndex(storyIndex);
    });
};