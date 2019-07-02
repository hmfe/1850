"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const REQUEST = "https://jsonplaceholder.typicode.com/todos";

  let clearInputBtn = document.querySelector(".js-clear-input"),
    searchInput = document.querySelector(".js-input"),
    history = document.querySelector(".history"),
    searchHistoryList = document.querySelector(".js-history-list"),
    clearHistoryBtn = document.querySelector(".js-clear-history"),
    resultsList = document.querySelector(".js-results-list"),
    historyList = document.querySelector(".js-history-list"),
    form = document.querySelector(".form"),
    deleteTaskBtns = document.querySelectorAll(".js-delete-task"),
    localStorage = window.localStorage;

  function getTodosFromLocalStorage() {
    localStorage = window.localStorage;
    return JSON.parse(localStorage.getItem("todos"));
  }

  //creates history list item
  //@param {object} _todo Todo object from local storage
  function createHistoryListItem(_todo) {
    let item = document.createElement("li");
    item.className = "history__list-item";
    item.setAttribute("aria-label", "Task information");

    let taskName = document.createElement("span");
    taskName.innerText = _todo.title;
    taskName.className = "history__task js-task";

    let time = document.createElement("span");
    time.innerText = _todo.time;
    time.className = "history__time";

    let button = document.createElement("button");
    button.className = "btn-delete js-delete-task";
    button.innerHTML = "&#x2715;";
    let attributes = {
      role: "button",
      type: "button",
      "aria-label": "Delete task"
    };
    Object.keys(attributes).forEach(key => {
      button.setAttribute(key, attributes[key]);
    });

    item.appendChild(taskName);
    item.appendChild(time);
    item.appendChild(button);

    return item;
  }

  //delete all children from passed element
  //@param {object} _element element from page
  function deleteElementChildren(_element) {
    while (_element.firstChild) {
      _element.removeChild(_element.firstChild);
    }
  }

  //adds on click event to all delete task buttons which removes
  //list item (task and it's information) from search history list and from local storage
  function addClickEventToDeleteTaskBtns() {
    deleteTaskBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        let listItem = btn.parentElement,
          taskName = listItem.querySelector(".js-task").innerText,
          todoStorage = getTodosFromLocalStorage();

        if (Object.keys(todoStorage).includes(taskName)) {
          delete todoStorage[taskName];
          localStorage.setItem("todos", JSON.stringify(todoStorage));
          searchHistoryList.removeChild(listItem);
          //hide history section if there is no entries anymore
          if (Object.values(getTodosFromLocalStorage()).length === 0) {
            history.classList.remove("active");
          }
        }
      });
    });
  }

  //updates history list of selected todos
  function updateHistoryList() {
    let localStorageValues = Object.values(getTodosFromLocalStorage());
    if (localStorageValues.length > 0) {
      history.classList.add("active");

      deleteElementChildren(historyList);

      localStorageValues.forEach(todo => {
        historyList.appendChild(createHistoryListItem(todo));
      });

      deleteTaskBtns = document.querySelectorAll(".js-delete-task");
      addClickEventToDeleteTaskBtns();
    } else {
      history.classList.remove("active");
    }
  }

  //logic of result btn which sets value and focus of input,
  //adds item to local storage and updates history list
  //@param {string} _todoTitle
  function addLogicToResultBtn(_todoTitle) {
    searchInput.value = _todoTitle;
    searchInput.focus();
    saveTodoToLocalStorage(_todoTitle);
    updateHistoryList();
    resultsList.classList.remove("active");
  }

  //creates result list item
  //@param {string} _class Class name for list item
  //@param {string} _text Text for list item
  //@param {boolean} _tabbable Boolean that specify if list item is tabbable and has logic
  //@return {object} item Created list item
  function createResultListItem(_class, _text, _tabbable = true) {
    let item = document.createElement("li"),
      todoTitle = document.createTextNode(_text);

    item.appendChild(todoTitle);

    if (_tabbable) {
      item.className = _class;
      item.setAttribute("tabindex", "0");

      item.addEventListener("click", () => {
        addLogicToResultBtn(item.innerText);
      });

      item.addEventListener("keydown", event => {
        if (event.keyCode === 13) {
          addLogicToResultBtn(item.innerText);
        }
      });
    }

    return item;
  }

  //saves selected item to local storage
  //@param {string} _todo Inner text (name) of selected todo
  function saveTodoToLocalStorage(_todo) {
    let today = new Date(),
      todoObject =
        getTodosFromLocalStorage() != null
          ? JSON.parse(localStorage.getItem("todos"))
          : {};

    todoObject[_todo] = {
      title: _todo,
      time: `${today.toISOString().slice(0, 10)}, ${today.toLocaleTimeString(
        "en-US"
      )}`
    };

    localStorage.setItem("todos", JSON.stringify(todoObject));
  }

  //displays data from API
  //@param {array} _fetchedData Array of to-do's from API
  function displayFetchedAPIData(_fetchedData) {
    resultsList.classList.add("active");
    deleteElementChildren(resultsList);
    //adding items to list
    if (_fetchedData.length > 0) {
      _fetchedData.forEach(elem => {
        resultsList.appendChild(
          createResultListItem("results__item js-result-item", elem.title)
        );
      });
    } else {
      resultsList.appendChild(
        createResultListItem("results__item", "No results.", false)
      );
    }
  }

  //initial display if history list on page load
  try {
    updateHistoryList();
  } catch (err) {
    // console.log(err.message);
  }

  //fetching data from API when input's value change
  searchInput.addEventListener("input", event => {
    let value = event.target.value;
    if (value && value.trim().length > 0) {
      fetch(REQUEST)
        .then(response => {
          return response.ok
            ? response.json()
            : Promise.reject("Something went wrong with the API");
        })
        .then(data => {
          let filteredData = data.filter(item => item.title.startsWith(value));
          displayFetchedAPIData(filteredData);
        })
        .catch(error => console.log("ERROR:", error));
    } else {
      resultsList.classList.remove("active");
    }
  });

  //on click event that clears input's value
  clearInputBtn.addEventListener("click", () => {
    searchInput.value = "";
    deleteElementChildren(resultsList);
    resultsList.classList.remove("active");
  });

  //delete all search history
  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("todos");
    deleteElementChildren(searchHistoryList);
    history.classList.remove("active");
  });

  form.addEventListener("submit", e => {
    //prevented so page doesn't reload
    e.preventDefault();
    let inputValue = searchInput.value;

    if (inputValue.trim().length > 0) {
      saveTodoToLocalStorage(searchInput.value);
      updateHistoryList();
    }
  });
});
