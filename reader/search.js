EPUBJS.reader.search = {};

// Search Server -- https://github.com/futurepress/epubjs-search
EPUBJS.reader.search.SERVER = "http://localhost:5000";

EPUBJS.reader.search.request = function(q, callback) {
	var fetch = $.ajax({
		dataType: "json",
		url: EPUBJS.reader.search.SERVER + "/search?q=" + encodeURIComponent(q) 
	});

	fetch.fail(function(err) {
		console.error(err);
	});

	fetch.done(function(results) {
		callback(results);
	});
};

EPUBJS.reader.plugins.SearchView = function(Book) {
	var reader = this;
	
	var $searchBox = $("#searchBox"),
			$searchResults = $("#searchResults"),
			$tocView = $("#tocView"),
			$searchView = $("#searchView"),
			iframeDoc;
	
	var searchShown = false;
	
	var onShow = function() {
		query();
		searchShown = true;
		$searchView.addClass("shown");
	};
	
	var onHide = function() {
		searchShown = false;
		$searchView.removeClass("shown");
	};
	
	var query = function() {
		var q = $searchBox.val();
		
		if(q == '') {
			return;
		}
		
		$searchResults.empty();
		$searchResults.append("<li><p>Searching...</p></li>");
		
		
		
		EPUBJS.reader.search.request(q, function(data) {
			var results = data.results;
			
			$searchResults.empty();
			
			if(iframeDoc) { 
				$(iframeDoc).find('body').unhighlight();
			}
			
			if(results.length == 0) {
				$searchResults.append("<li><p>No Results Found</p></li>");
				return;
			}
			
			iframeDoc = $("#viewer iframe")[0].contentDocument;
			$(iframeDoc).find('body').highlight(q, { element: 'span' });
			
			results.forEach(function(result) {
				var $li = $("<li></li>");
				var $item = $("<a href='"+result.href+"' data-cfi='"+result.cfi+"'><span>"+result.title+"</span><p>"+result.highlight+"</p></a>");
	
				$item.on("click", function(e) {
					var $this = $(this),
							cfi = $this.data("cfi");
					
					e.preventDefault();
					
					Book.gotoCfi(cfi);
					
					Book.on("renderer:chapterDisplayed", function() {
						iframeDoc = $("#viewer iframe")[0].contentDocument;
						$(iframeDoc).find('body').highlight(q, { element: 'span' });
					})
					
					
					
				});
				$li.append($item);
				$searchResults.append($li);
			});
	
		});
	
	};
	
	$searchBox.on("search", function(e) {
		var q = $searchBox.val();
		
		//-- SearchBox is empty or cleared
		if(q == '') {
			$searchResults.empty();
			
			if(reader.SidebarView.activePanel != "SearchView") {
				reader.SidebarView.changePanelTo("TocView");
			}
			
			$(iframeDoc).find('body').unhighlight();
			iframeDoc = false;
			return;
		}
		
		if(reader.SidebarView.activePanel != "SearchView") {
			reader.SidebarView.changePanelTo("SearchView");
		}
		
		e.preventDefault();
	});
	
	
	
	return {
		"show" : onShow,
		"hide" : onHide
	};
};
