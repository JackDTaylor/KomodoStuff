/**
 * Duplicates remote file or folder with name like "somefile_Copy.ext"
 */

try {
	if(ko.places.manager.currentPlaceIsLocal) {
	  // I'm a cowboy programmer, I ain't need dat localhost stuff
		ko.dialogs.alert("Local places are not supported yet");
		return;
	}

  // Closures are AWESOME!
	var RCService = Cc["@activestate.com/koRemoteConnectionService;1"].getService(Ci.koIRemoteConnectionService);
	var conn = RCService.getConnectionUsingUri(ko.places.manager.currentPlace);

	var osPath = Cc["@activestate.com/koOsPath;1"].getService(Ci.koIOsPath);
	var treeView = placesViewbox.gPlacesViewMgr.view;
	var selection = placesViewbox.gPlacesViewMgr.getSelectedURIs();
	var selectionBackup = placesViewbox.gPlacesViewMgr.getSelectedURIs();

	var copyFileWorker = function() {
		if(selection.length < 1) {
			treeView.refreshFullTreeView();

			treeView.selection.clearSelection();

			selectionBackup.map(function(value) {
				value = treeView.getRowIndexForURI(value);
				treeView.selection.rangedSelect(value, value, true);

				return true;
			});

			return;
		}

		var quoteRegex = new RegExp("^" + ko.places.manager.currentPlace.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"));
		var srcFile = selection.pop().replace(quoteRegex, '');
		var destFile = osPath.withoutExtension(srcFile) + '_Copy' + osPath.getExtension(srcFile).replace(quoteRegex, '');

		if(/^[\/~]/.test(srcFile) == false) {
			srcFile = '/' + srcFile
		}

		if(/^[\/~]/.test(destFile) == false) {
			destFile = '/' + destFile
		}

		var command = 'cp -rn "' + srcFile + '" "' + destFile + '"';
		conn.runCommand(command, false, {}, {});

		copyFileWorker();
	};

  // Function instead of while/for just because the Voices told me to do this.
	copyFileWorker();
} catch (ex) {
	ko.dialogs.alert("Error: " + ex);
}
