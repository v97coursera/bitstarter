#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLINDEX_DEFAULT = "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_enode xit_code
    }
    return instr;
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, urlindex) {
    
    //if we're passed a URL, check if it exists then parse it with cheerio
    if(urlindex && urlindex.length > 0){
	console.log("using urlindex");

	var urlString = urlindex.toString();

	restler.get(urlString).on('complete', function(result){
	    if(result instanceof Error){
		console.log("%s Url does not exist. Exiting.", urlString);
		process.exit(1);
	    }
	    else
	    {
		console.log("%s Url exists!", urlString);
		$ = cheerio.load(result.toString());	    
		return doCheck($, checksfile);
		
	    }
	});


    }
    else
    {
	console.log("htmlfile exists")
	$ = cheerioHtmlFile(htmlfile);	  
	return doCheck($, checksfile);
	
    }        
   
};


var doCheck = function($, checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;	
        out[checks[ii]] = present;
    }
    //console.log(out);
    return out;
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <file_url>', 'Url of index.html', URLINDEX_DEFAULT)
        .parse(process.argv);

    var checkJson = checkHtmlFile(program.file, program.checks, program.url);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}