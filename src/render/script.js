window.electronAPI.send("getFS", {});

const fileTree = document.getElementById("fs");
const editPane = document.getElementById("edit");
const previewPane = document.getElementById("preview");
const prefrencesDialog = document.getElementById("prefrences");

// Var stores the current file open. Used when saving files
let currentFilePath = "";

// Render file structure
window.electronAPI.on("fsResponse", (event, data) => {
    const folders = data["folders"];
    const mdFiles = data["markdown"];
    const otherFiles = data["other"];
    const rootNotes = data["root"];

    // Render folders
    for (let i = 0; i < folders.length; i++) {
        const thisFolder = folders[i];

        const dropDown = document.createElement("details");
        dropDown.id = `${thisFolder.parentPath}/${thisFolder.name}`;
        dropDown.classList.add("folder");

        const summary = document.createElement("summary");
        summary.innerText = thisFolder.name;
        summary.classList.add("folderName");

        dropDown.appendChild(summary);

        if (rootNotes === thisFolder.parentPath) {
            // Root level folders
            fileTree.appendChild(dropDown);
        } else {
            // Child level folders
            const margin = ((thisFolder.parentPath.split("/").length) - 3) * 5

            dropDown.style.marginLeft = `${margin}px`;

            const parentElm = document.getElementById(thisFolder.parentPath);
            parentElm.appendChild(dropDown);
        };
    };

    // Render md files
    for (let i = 0; i < mdFiles.length; i++) {
        const thisFile = mdFiles[i];

        const btn = document.createElement("button");
        btn.innerText = (thisFile.name).substring(0, thisFile.name.length - 3);
        btn.classList.add("file", "mdFile");
        btn.id = thisFile.parentPath + "/" + thisFile.name;
        btn.addEventListener("click", getNote);

        if (thisFile.parentPath === rootNotes) {
            // Root level notes
            fileTree.appendChild(btn);
            fileTree.appendChild(document.createElement("br"));
        } else {
            // Child level notes
            const margin = ((thisFile.parentPath.split("/").length) - 3) * 5

            btn.style.marginLeft = `${margin}px`;

            const parentElm = document.getElementById(thisFile.parentPath);
            parentElm.appendChild(btn);
            parentElm.appendChild(document.createElement("br"));
        };
    };

    // Render non md files
    for (let i = 0; i < otherFiles.length; i++) {
        const thisFile = otherFiles[i];

        const btn = document.createElement("button");
        btn.innerText = thisFile.name;
        btn.classList.add("file", "otherFile");

        if (thisFile.parentPath === rootNotes) {
            // Root level notes
            fileTree.appendChild(btn);
            fileTree.appendChild(document.createElement("br"));
        } else {
            // Child level notes
            const margin = ((thisFile.parentPath.split("/").length) - 3) * 5

            btn.style.marginLeft = `${margin}px`;

            const parentElm = document.getElementById(thisFile.parentPath);
            parentElm.appendChild(btn);
            parentElm.appendChild(document.createElement("br"));
        };
    };
});

// Functions to create new md files
function createFileNameInput(e) {
    e.preventDefault();

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "newFileName"

    fileTree.append(nameInput);

    document.getElementById("newFileName").focus();

    handleNewFileName();
};

function createFile() {
    const input = document.getElementById("newFileName");

    if (input.value.trim().length === 0) {
        input.remove()

        return;
    };

    window.electronAPI.send("createNote", { title: input.value, parentPath: "notes" });

    input.remove()
};

function handleNewFileName() {
    const input = document.getElementById("newFileName");

    input.addEventListener("focusout", (e) => {
        createFile();

        return;
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            createFile();

            return;
        };
    });
};

document.getElementById("createFile").addEventListener("click", createFileNameInput)

// Functions to create new folders
function createFolderNameInput(e) {
    e.preventDefault();

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "newFolderName"

    fileTree.append(nameInput);

    document.getElementById("newFolderName").focus();

    handleNewFolderName();
};

function createFolder() {
    const input = document.getElementById("newFolderName");

    if (input.value.trim().length === 0) {
        input.remove()

        return;
    };

    window.electronAPI.send("createFolder", { name: input.value, parentPath: "notes" });

    input.remove()
};

function handleNewFolderName() {
    const input = document.getElementById("newFolderName");

    input.addEventListener("focusout", (e) => {
        createFolder();

        return;
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            createFolder();
            
            return;
        };
    });
};

// Functions handling notes
function updatePreview() {
    const md = editPane.value;
    const rendered = marked(md, { breaks: true });

    previewPane.innerHTML = rendered;
};

function getNote(e) {
    const path = e.target.id;

    [].forEach.call(document.getElementsByClassName("selected"), function(el) {
        el.classList.remove("selected");
    });

    document.getElementById(path).classList.add("selected");

    window.electronAPI.send("getNote", { filePath: path });

    window.electronAPI.on("noteContents", (event, data) => {
        try {
            document.getElementById("motto").style.display = "none";
        } catch (e) {
            console.error(e);
        };

        editPane.value = data;
        updatePreview();

        currentFilePath = path;
    });
};

editPane.addEventListener("input", updatePreview);

// Save file from window menu
window.electronAPI.requestSave(() => {
    if (currentFilePath.trim().length === 0) {
        return;
    };
    
    window.electronAPI.send("saveNote", { filePath: currentFilePath, content: editPane.value });
});

document.getElementById("createFolder").addEventListener("click", createFolderNameInput);

// Functions for settings/prefrences
window.electronAPI.openSettings(() => {
    prefrencesDialog.showPopover();
});

function updateTheme() {
    const darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const appTheme = localStorage.getItem("theme");

    if (appTheme === null || appTheme === "sys") {
        if (darkModeMql && darkModeMql.matches) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
        };
    } else {
        if (appTheme === "dark") {
            document.body.setAttribute('data-theme', 'dark');
        } else if (appTheme === "light") {
            document.body.setAttribute('data-theme', 'light');
        };
    };

    if (appTheme !== "sys") {
        if (document.body.getAttribute("data-theme") === "dark") {
            document.getElementById("theme").value = "dark";
        } else {
            document.getElementById("theme").value = "light";
        };
    } else {
        document.getElementById("theme").value = "sys";
    };
}

function showPreview() {
    if (localStorage.getItem("showPreview") === "true" || localStorage.getItem("showPreview") === null) {
        document.getElementById("showPreview").checked = true;

        document.body.setAttribute("data-showpreview", "true");
    } else {
        document.getElementById("showPreview").checked = false;

        document.body.setAttribute("data-showpreview", "false");
    };
};

Array.from(document.getElementsByClassName("prefrenceSetting")).forEach(elm => {
    elm.addEventListener("input", (e) => {
        const setting = e.target.id;

        if (e.target.value === "on") {
            localStorage.setItem(setting, e.target.checked);
        } else {
            localStorage.setItem(setting, e.target.value);
        };

        if (setting === "theme") {
            updateTheme();
        };

        if (setting === "showPreview") {
            showPreview();
        };
    });
});

updateTheme();
showPreview();

// Code to delete a note
//window.electronAPI.send("deleteNote", { filePath: "thingy.md" });
