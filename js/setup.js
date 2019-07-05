import { getBoardData, getGrade, getSolved, getValidation }  from './api.js';

let historyIndex = 0;
let boardHistory = [];

function setup() {

    for (var i = 0; i < 9; i++) {
        let $div = $(`<div class="row${i+1}"></div>`);
        for (var j = 0; j < 9; j++) {
            let $span = $(`<input class="col${j+1}" data-tooltip="" data-error="">`)
            // let $input = $(`<input class="col${j+1}">`);
            $div.append($span);
        }
        $('#board').append($div);
    }

    $("input").keydown(function(e) {
        if ($(this).val().length > 0) {
            if (e.which < 8 || e.which > 9) {
                e.preventDefault();
            }
        } else if (e.which<49 || (e.which>57 && e.which<97) || e.which>105){
            if (e.which != 9) {
                e.preventDefault();
            }
        }
    });

    $('input').change(function(e) {
        let col = $(this).attr("class").split(' ')[0];
        let row = $(this).parent().attr("class");
        col = +col.slice(col.length-1) - 1;
        row = +row.slice(row.length-1) - 1;

        // console.log($(this).val());
        let newBoard = JSON.parse(JSON.stringify(boardHistory[historyIndex]["board"]));
        // console.log(newBoard);
        newBoard[row][col] = $(this).val().length>0 ? +$(this).val() : 0;
        boardHistory.push({"board": newBoard, "messages": [[],[],[],[],[],[],[],[],[]]});
        historyIndex=boardHistory.length-1;
        validateAllCells();
        // checkForErrors(row, col);
    });

    $('input').bind({
        mousemove : changeTooltipPosition,
        mouseenter : showTooltip,
        mouseleave: hideTooltip
    });
}

function manageBoard(difficultyString) {
    boardHistory = [];
    historyIndex = 0;
    let status = 'unsolved';
    getBoardData(difficultyString)
    .then(data => {
        boardHistory.push(data);
        boardHistory[historyIndex]["messages"] = [[],[],[],[],[],[],[],[],[]];
        if (difficultyString === 'random') {
            getGrade(data).done(grade => {
                let { difficulty } = grade;
                setBoard(boardHistory[historyIndex]["board"], status, difficulty);
                validateAllCells();
            })
        }
        setBoard(boardHistory[historyIndex]["board"], status, difficultyString);
        validateAllCells();
    })
    .catch(err => {
        console.log(err);
        $('#title').text('500 Server Error!')
        $('#messages').css({'background-color': 'red'})
    })
} 

function validate(){
    getValidation(boardHistory[historyIndex]["board"])
        .done(res => {
            let { status } = res;
            $('#status').text(status);
            if (status === "solved") {
                $('#congrats-message').css({"display": "block"});
            }
        })
}

function reset() {
    let boardData = [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
    ]
    historyIndex = 0;
    boardHistory = [];
    let diff = '';
    status = '';
    setBoard(boardData, status, diff);
    validateAllCells();
}

function solve() {
    getSolved(boardHistory[0])
    .done(function (data) {
        setBoard(data.solution, data.status,data.difficulty);
        $('#congrats-message').css({"display": "block"});
    })
}

function getBoard(initialBoardData) {
    let board = [[],[],[],[],[],[],[],[],[]];
    for (let row = 0; row < initialBoardData.length; row++) {
        for (let column = 0; column < initialBoardData[row].length; column++) {
            board[row][column] = $(`.row${row+1}>.col${column+1}`).val();
        }
    }
}

function setBoard(data, status, difficultyString) {
    for (let row = 0; row < data.length; row++) {
        for (let column = 0; column < data[row].length; column++) {
            if (data[row][column]>0) {
                $(`.row${row+1}>.col${column+1}`).val(data[row][column]);
                $(`.row${row+1}>.col${column+1}`).attr("disabled", true);
            } else {
                $(`.row${row+1}>.col${column+1}`).val('');
                $(`.row${row+1}>.col${column+1}`).attr("disabled", false);
            }
        }
    }
    $('#diff').text(difficultyString);
    $('#status').text(status);
}

function undo(){
    if (historyIndex === 0) {
        return;
    }
    // console.log(historyIndex);
    historyIndex--;
    // console.log(historyIndex);

    // console.log(boardHistory[historyIndex]["board"], historyIndex);

    for (let row = 0; row < boardHistory[historyIndex]["board"].length; row++) {
        for (let column = 0; column < boardHistory[historyIndex]["board"][row].length; column++) {
            checkForErrors(row, column);
            
            if (boardHistory[historyIndex]["board"][row][column] !== boardHistory[historyIndex+1]["board"][row][column]) {
                let value = boardHistory[historyIndex]["board"][row][column] != 0 ? boardHistory[historyIndex]["board"][row][column] : ""
                $(`.row${row+1}>.col${column+1}`).val(value);
            }
        }
    }
}

function redo(){
    if (historyIndex === boardHistory.length-1) {
        return;
    }
    historyIndex++;

    for (let row = 0; row < boardHistory[historyIndex]["board"].length; row++) {
        for (let column = 0; column < boardHistory[historyIndex]["board"][row].length; column++) {
            checkForErrors(row, column);
            if (boardHistory[historyIndex]["board"][row][column] != boardHistory[historyIndex-1]["board"][row][column]) {
                let value = boardHistory[historyIndex]["board"][row][column] != 0 ? boardHistory[historyIndex]["board"][row][column] : ""
                $(`.row${row+1}>.col${column+1}`).val(value);
            }
        }
    }
}

export { setup, manageBoard, reset, solve, validate, undo, redo };

var changeTooltipPosition = function(event, clazz) {
    var tooltipX = event.pageX - 8;
    var tooltipY = event.pageY + 8;
    $(`div.${clazz}`).css({top: tooltipY, left: tooltipX});
};

var showTooltip = function(event) {
    $('div.tooltip').remove();
    $('div.error-tooltip').remove();
    let clazz;
    if($(this).val() === "" && !$(this).hasClass("error")) {
        $(`<div class="tooltip">${$(this).attr("data-tooltip")}</div>`)
            .appendTo('body');
        clazz = "tooltip";
    } else {
        $(`<div class="error-tooltip">${$(this).attr("data-error")}</div>`)
            .appendTo('body');
        clazz = "error-tooltip";
    }
    changeTooltipPosition(event, clazz);
};

var hideTooltip = function() {
    $('div.tooltip').remove();
    $('div.error-tooltip').remove();
};

function validateAllCells() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            // if(boardHistory[historyIndex]["board"][i][j] !== 0){
            //     continue;
            // }
            validateCell(i, j);
        }
    }
}

function checkForErrors(row, col) {
    let element = boardHistory[historyIndex]["board"][row][col];
    let validNums = boardHistory[historyIndex]["messages"][row][col]["hints"];
    if (validNums.includes(element) || element === 0) {
        $(`.row${row+1}>.col${col+1}`).removeClass("error");
        boardHistory[historyIndex]["messages"][row][col]["errors"] = "";
        $(`.row${row+1}>.col${col+1}`).attr('data-error', "");
    } else {
        $(`.row${row+1}>.col${col+1}`).addClass("error");
        let indexInRow = findDuplicatedCellInRow(row, col, element);
        let indexInCol = findDuplicatedCellInCol(row, col, element);
        let indexInSquare = findDuplicatedCellInSquare(row, col, element);

        // console.log(indexInRow, indexInCol, indexInSquare);

        let errorMsg = 'This value duplicates cells:';
        if (indexInRow.length > 0) {
            errorMsg += ` - in row: ${indexInRow.toString()};`;
        }
        if (indexInCol.length > 0) {
            errorMsg += ` - in column: ${indexInCol.toString()};`;
        }
        if (indexInSquare.length > 0) {
            errorMsg += ` - in square: ${indexInSquare.toString()};`;
        }
        // console.log(errorMsg);
        boardHistory[historyIndex]["messages"][row][col]["errors"] = errorMsg;
        $(`.row${row+1}>.col${col+1}`).attr('data-error', errorMsg);
    }

}

function findDuplicatedCellInRow(row, col, element) {
    let cells = [];
    boardHistory[historyIndex]["board"][row].forEach((el, idx) => {
        if (el === element && idx != col) {
            cells.push([row+1, idx+1]);
        }
    });
    return cells;
}

function findDuplicatedCellInCol(row, col, element) {
    let cells = [];
    boardHistory[historyIndex]["board"].forEach((el, idx) => {
        if (el[col] === element && idx != row) {
            cells.push([idx+1, col+1]);
        }
    });
    return cells;
}

function findDuplicatedCellInSquare(row, col, element) {
    let rowStartIndex = (row>=0 && row<=2) ? 0 : (row>=3 && row<=5) ? 3 : 6;
    let rowEndIndex = (row>=0 && row<=2) ? 2 : (row>=3 && row<=5) ? 5 : 8;
    let colStartIndex = (col>=0 && col<=2) ? 0 : (col>=3 && col<=5) ? 3 : 6;
    let colEndIndex = (col>=0 && col<=2) ? 2 : (col>=3 && col<=5) ? 5 : 8;

    let cells = []

    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        for (let j = colStartIndex; j <= colEndIndex; j++) {
            let num = boardHistory[historyIndex]["board"][i][j];
            if (num === element && (i != row || j != col)) {
                cells.push([i+1, j+1]);
            }
        }
    }
    return cells;
}


function validateCell(row, col) {
    let validNums = [];
    let allNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let invalidNumsRow = invalidInRow(row, col);
    let invalidNumsCol = invalidInCol(row, col);
    let invalidNumsSquare = invalidInSquare(row, col);
    // console.log(invalidNumsRow, invalidNumsCol, invalidNumsSquare);

    allNums.forEach(el => {
        if (!invalidNumsRow.includes(el)
            && !invalidNumsCol.includes(el)
            && !invalidNumsSquare.includes(el)
            && !validNums.includes(el)) {
            validNums.push(el);
        }
    })

    boardHistory[historyIndex]["messages"][row][col] = { "hints": validNums, "errors": "" };
    $(`.row${row+1}>.col${col+1}`).attr("data-tooltip", `The valid numbers are: ${validNums.toString()}`);
    checkForErrors(row, col);
}

function invalidInRow(row, col) {
    let invalidNums = [];
    boardHistory[historyIndex]["board"][row].forEach((el, idx) => {
        if (el != 0 && idx != col) {
            invalidNums.push(el);
        }
    });

    return invalidNums;
}

function invalidInCol(row, col) {
    let invalidNums = [];
    boardHistory[historyIndex]["board"].forEach((el, idx) => {
        if (el[col] != 0 && idx != row) {
            invalidNums.push(el[col]);
        }
    });

    return invalidNums;
}

function invalidInSquare(row, col) {
    let invalidNums = [];
    let rowStartIndex = (row>=0 && row<=2) ? 0 : (row>=3 && row<=5) ? 3 : 6;
    let rowEndIndex = (row>=0 && row<=2) ? 2 : (row>=3 && row<=5) ? 5 : 8;
    let colStartIndex = (col>=0 && col<=2) ? 0 : (col>=3 && col<=5) ? 3 : 6;
    let colEndIndex = (col>=0 && col<=2) ? 2 : (col>=3 && col<=5) ? 5 : 8;

    // console.log(rowStartIndex, rowEndIndex, colStartIndex, colEndIndex);

    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        for (let j = colStartIndex; j <= colEndIndex; j++) {
            let num = boardHistory[historyIndex]["board"][i][j];
            if (num != 0 && i != row && j != col) {
                // console.log(num);
                invalidNums.push(num);
            }
        }
    }

    return invalidNums;
}