import { getBoardData, getGrade, getSolved, getValidation }  from './api.js';

let historyIndex = 0;
let boardHistory = [];

function setup() {

    for (var i = 0; i < 9; i++) {
        let $div = $(`<div class="row${i+1}"></div>`);
        for (var j = 0; j < 9; j++) {
            let $span = $(`<input class="col${j+1}" data-tooltip="hello!">`)
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
        let col = $(this).attr("class");
        let row = $(this).parent().attr("class");
        col = +col.slice(col.length-1) - 1;
        row = +row.slice(row.length-1) - 1;

        console.log($(this).val());
        let newBoard = JSON.parse(JSON.stringify(boardHistory[historyIndex]["board"]));
        console.log(newBoard);
        newBoard[row][col] = $(this).val().length>0 ? +$(this).val() : 0;
        boardHistory.push({"board": newBoard, "hints": [[],[],[],[],[],[],[],[],[]]});
        historyIndex=boardHistory.length-1;
        validateAllCells();
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
        boardHistory[historyIndex]["hints"] = [[],[],[],[],[],[],[],[],[]];
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
    let isDone = false;

    console.log(boardHistory[historyIndex]["board"], historyIndex);

    for (let row = 0; row < boardHistory[historyIndex]["board"].length; row++) {
        for (let column = 0; column < boardHistory[historyIndex]["board"][row].length; column++) {
            if (boardHistory[historyIndex]["board"][row][column] !== boardHistory[historyIndex+1]["board"][row][column]) {
                let value = boardHistory[historyIndex]["board"][row][column] != 0 ? boardHistory[historyIndex]["board"][row][column] : ""
                $(`.row${row+1}>.col${column+1}`).val(value);
                isDone = true;
                break;
            }
        }
        if (isDone) {
            break;
        }
    }
}

function redo(){
    if (historyIndex === boardHistory.length-1) {
        return;
    }
    historyIndex++;
    let isDone = false;

    for (let row = 0; row < boardHistory[historyIndex]["board"].length; row++) {
        for (let column = 0; column < boardHistory[historyIndex]["board"][row].length; column++) {
            if (boardHistory[historyIndex]["board"][row][column] != boardHistory[historyIndex-1]["board"][row][column]) {
                let value = boardHistory[historyIndex]["board"][row][column] != 0 ? boardHistory[historyIndex]["board"][row][column] : ""
                $(`.row${row+1}>.col${column+1}`).val(value);
                isDone = true;
                break;
            }
        }
        if (isDone) {
            break;
        }
    }
}

export { setup, manageBoard, reset, solve, validate, undo, redo };

var changeTooltipPosition = function(event) {
    var tooltipX = event.pageX - 8;
    var tooltipY = event.pageY + 8;
    $('div.tooltip').css({top: tooltipY, left: tooltipX});
};

var showTooltip = function(event) {
    $('div.tooltip').remove();
    $(`<div class="tooltip">${$(this).attr("data-tooltip")}</div>`)
        .appendTo('body');
    changeTooltipPosition(event);
};

var hideTooltip = function() {
    $('div.tooltip').remove();
};

function validateAllCells() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if(boardHistory[historyIndex]["board"][i][j] !== 0){
                continue;
            }
            validateCell(i, j);
        }
    }
}

function validateCell(row, col) {
    let validNums = [];
    let allNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let invalidNumsRow = invalidInRow(row);
    let invalidNumsCol = invalidInCol(col);
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

    boardHistory[historyIndex]["hints"][row][col] = validNums;
    $(`.row${row+1}>.col${col+1}`).attr("data-tooltip", `The valid numbers are: ${validNums.toString()}`);
    console.log(validNums.toString(), invalidNumsRow, invalidNumsCol, invalidNumsSquare);
}

function invalidInRow(row) {
    let invalidNums = [];
    boardHistory[historyIndex]["board"][row].forEach(el => {
        if (el != 0) {
            invalidNums.push(el);
        }
    });

    return invalidNums;
}

function invalidInCol(col) {
    let invalidNums = [];
    boardHistory[historyIndex]["board"].forEach(el => {
        if (el[col] != 0) {
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

    console.log(rowStartIndex, rowEndIndex, colStartIndex, colEndIndex);

    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        for (let j = colStartIndex; j <= colEndIndex; j++) {
            let num = boardHistory[historyIndex]["board"][i][j];
            if (num != 0) {
                console.log(num);
                invalidNums.push(num);
            }
        }
    }

    return invalidNums;
}