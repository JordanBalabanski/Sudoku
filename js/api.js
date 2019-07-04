const urlString = 'https://sugoku.herokuapp.com';
const getBoardString = '/board?difficulty=';
const validateString = '/validate';
const solveString = '/solve';
const gradeString = '/grade';

function getBoardData(difficultyString){
    return $.get(urlString + getBoardString + difficultyString);
}

function getGrade (board) {
    return $.post('https://sugoku.herokuapp.com/grade', JSON.stringify(board));
}

function getSolved(board) {
    return $.post(urlString + solveString, {board: JSON.stringify(board)});
}

function getValidation(board) {
    return $.post(urlString + validateString, {board: JSON.stringify(board)});
}

export { getBoardData, getGrade, getSolved, getValidation };