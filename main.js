// LocalStorage에 저장할 때 사용하는 키
const STORAGE_KEY = "my-todo-list";

// 할 일 목록 (저장된 데이터가 있으면 불러옴)
let todos = loadTodos();

// 현재 선택된 필터 (all: 전체, active: 진행중, completed: 완료)
let currentFilter = "all";

const inputEl = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const countEl = document.getElementById("todo-count");
const clearCompletedEl = document.getElementById("clear-completed-button");
const filterButtonEls = document.querySelectorAll(".filter-button");

// LocalStorage에서 할 일 목록을 불러옴
function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    // 저장된 데이터가 손상되었거나 저장소를 쓸 수 없으면 빈 목록으로 시작
    console.error("할 일 목록을 불러오지 못했습니다", error);
    return [];
  }
}

// 할 일 목록을 LocalStorage에 저장
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // 저장 공간 부족 등으로 실패하면 새로고침 시 사라질 수 있음을 알림
    console.error("할 일 목록을 저장하지 못했습니다", error);
    alert("저장에 실패했습니다. 새로고침하면 변경 내용이 사라질 수 있습니다.");
  }
}

// 전체 개수와 완료 개수를 화면에 표시
function updateCount() {
  const completedCount = todos.filter((todo) => todo.completed).length;
  countEl.textContent = `전체 ${todos.length}개, 완료 ${completedCount}개`;
  // 지울 항목이 없으면 일괄 삭제 버튼을 비활성화
  clearCompletedEl.disabled = completedCount === 0;
}

// 현재 필터에 맞지 않는 항목을 숨김
function applyFilter() {
  for (const itemEl of listEl.children) {
    const completed = itemEl.classList.contains("completed");
    itemEl.hidden =
      (currentFilter === "active" && completed) ||
      (currentFilter === "completed" && !completed);
  }
}

// 필터를 바꾸고 선택된 버튼을 강조
function setFilter(filter) {
  currentFilter = filter;
  filterButtonEls.forEach((buttonEl) => {
    buttonEl.setAttribute("aria-pressed", String(buttonEl.dataset.filter === filter));
  });
  applyFilter();
}

// 목록이 바뀔 때마다 저장하고 개수와 표시 항목을 갱신
function handleTodosChange() {
  saveTodos();
  updateCount();
  applyFilter();
}

// 할 일 하나를 화면에 표시할 요소로 만듦
function createTodoElement(todo) {
  const itemEl = document.createElement("li");
  itemEl.className = "todo-item";
  // 불러온 할 일의 완료 상태를 화면에 반영
  itemEl.classList.toggle("completed", todo.completed);

  // 글자를 눌러도 체크되도록 label로 묶음
  const labelEl = document.createElement("label");
  labelEl.className = "todo-label";

  const checkboxEl = document.createElement("input");
  checkboxEl.type = "checkbox";
  checkboxEl.checked = todo.completed;
  checkboxEl.addEventListener("change", () => toggleTodo(todo, itemEl, checkboxEl.checked));

  const textEl = document.createElement("span");
  textEl.className = "todo-text";
  textEl.textContent = todo.text;

  labelEl.append(checkboxEl, textEl);

  const deleteEl = document.createElement("button");
  deleteEl.type = "button";
  deleteEl.className = "delete-button";
  deleteEl.textContent = "삭제";
  deleteEl.setAttribute("aria-label", `${todo.text} 삭제`);
  deleteEl.addEventListener("click", () => deleteTodo(todo, itemEl));

  itemEl.append(labelEl, deleteEl);
  return itemEl;
}

// 입력값으로 할 일을 추가
function addTodo() {
  const text = inputEl.value.trim();

  if (text === "") {
    alert("할 일을 입력하세요");
    inputEl.focus();
    return;
  }

  // 입력 내용을 고칠 수 있도록 입력창은 비우지 않음
  if (todos.some((todo) => todo.text === text)) {
    alert("이미 등록된 할 일입니다");
    inputEl.focus();
    return;
  }

  const todo = { text, completed: false };
  todos.push(todo);
  listEl.append(createTodoElement(todo));

  // 완료 필터에서는 새 할 일이 보이지 않으므로 전체 보기로 전환
  if (currentFilter === "completed") {
    setFilter("all");
  }
  handleTodosChange();

  // 다음 할 일을 바로 입력할 수 있도록 비우고 포커스 유지
  inputEl.value = "";
  inputEl.focus();
}

// 완료 상태를 바꾸고 취소선 표시에 반영
function toggleTodo(todo, itemEl, completed) {
  todo.completed = completed;
  itemEl.classList.toggle("completed", completed);
  handleTodosChange();
  // 필터 때문에 항목이 숨겨지면 키보드 포커스를 잃지 않도록 입력창으로 이동
  if (itemEl.hidden) {
    inputEl.focus();
  }
}

// 배열과 화면에서 할 일을 제거
function deleteTodo(todo, itemEl) {
  todos = todos.filter((item) => item !== todo);
  itemEl.remove();
  handleTodosChange();
  // 삭제 버튼이 사라져도 키보드 포커스를 잃지 않도록 입력창으로 이동
  inputEl.focus();
}

// 완료된 할 일을 배열과 화면에서 한 번에 제거
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  listEl.querySelectorAll(".todo-item.completed").forEach((itemEl) => itemEl.remove());
  handleTodosChange();
  // 버튼이 비활성화되어도 키보드 포커스를 잃지 않도록 입력창으로 이동
  inputEl.focus();
}

// 앱 초기화 함수
function initApp() {
  // 저장되어 있던 할 일을 화면에 표시
  listEl.append(...todos.map(createTodoElement));
  updateCount();

  document.getElementById("add-button").addEventListener("click", addTodo);
  clearCompletedEl.addEventListener("click", clearCompleted);

  filterButtonEls.forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => setFilter(buttonEl.dataset.filter));
  });

  inputEl.addEventListener("keydown", (event) => {
    // 한글 조합 중의 Enter는 무시 (같은 항목이 두 번 추가되는 것을 방지)
    if (event.key === "Enter" && !event.isComposing) {
      addTodo();
    }
  });
}

initApp();
