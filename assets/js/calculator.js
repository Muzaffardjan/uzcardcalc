/**
 * Тестовая задача для UzCard.
 *
 * @author    Muzaffardjan Karaev
 * @copyright Copyright (c) "K-SOFT" LTD 2017-2018
 * @license   "K-SOFT" LTD PUBLIC LICENSE
 * @link      https://karaev.uz
 * Created:   24.10.2018.10.2018 / 16:44
 */

(function ($, window, document) {
    'use strict';

    let calc = {},
        stack = [];

    let prevNumber,
        number,
        currentNumber,
        prevOperator,
        operator,
        mainScreen = document.querySelector('#main'),
        historyScreen = document.querySelector('#history'),
        prevButton,
        history,
        result;


    let Calculator = function () {};

    Calculator.prototype.updateHistory = function (button) {
        /* Update history for insert data to firebase */
        switch (button) {
            case '1/x':
                history += history.slice(0, -(number.length + button.length)) + ('1/' + number + ' ');
                break;
            case 'sqr':
                history = history.slice(0, -1) + 'sqr(' + number + ') ';
                break;
            case 'sqrt':
                history = history.slice(0, -1) + ('sqrt(' + number + ') ');
                break;
            default:
                history = (isNaN(prevButton) && isNaN(button))
                    ? history.slice(0, -1) + button
                    : history + button;
                break;
        }

        prevButton = button;

        return history;
    };

    Calculator.prototype.updateHistoryScreen = function (history) {
        historyScreen.value = history;
    };

    Calculator.prototype.updateMainScreen = function (val) {
        val = String(val);

        if (val.length > 10) {
            mainScreen.style.fontSize = '1.75rem';
            val = Math.round(val * 10000000000000000) / 10000000000000000;
        } else {
            mainScreen.style.fontSize = '3rem';
        }

        mainScreen.value = val;
    };

    Calculator.prototype.init = function () {
        prevNumber = '0';
        number = '0';
        currentNumber = '0';
        prevOperator = null;
        operator = null;
        result = null;
        history = '';
        prevButton = null;
        this.updateMainScreen(0);
        this.updateHistoryScreen(history);
    };

    Calculator.prototype.handler = function (button) {
        if (operator !== null) {
            switch (operator) {
                case '*':
                    currentNumber = currentNumber * button;
                    break;
                case '/':
                    currentNumber /= button;
                    break;
                case '+':
                case '-':
                    stack.push({
                        number: number,
                        operator: operator
                    }); // Set push
                    prevNumber = number;
                    number = 0;
                    currentNumber = button;
                    break;
            }

            prevOperator = operator;
            operator = null;
        } else {
            currentNumber = (mainScreen.value !== '0')
                ? currentNumber + button
                : button;
        }

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.dot = function (button) {
        if (button === '.' && currentNumber.indexOf('.') === -1) {
            currentNumber = currentNumber + button;

            this.updateHistoryScreen(this.updateHistory(currentNumber));
            this.updateMainScreen(currentNumber);
        }
    };

    Calculator.prototype.clearSymbol = function (button) {
        currentNumber = currentNumber.slice(0, -1);
        history = history.slice(0, -1);

        if (!currentNumber.length) {
            currentNumber = '0';
        }

        this.updateHistoryScreen(history);
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.sqr = function (button) {
        number = currentNumber;
        currentNumber = currentNumber * currentNumber;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.sqrt = function (button) {
        number = currentNumber;
        currentNumber = Math.sqrt(currentNumber);

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.fraction = function (button) {
        number = currentNumber;
        currentNumber = 1 / currentNumber;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.percentage = function () {
        history = history.slice(0, -(currentNumber.length + 1));
        currentNumber = result * currentNumber / 100;
        history += currentNumber + ' ';

        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.division = function (button) {
        number = currentNumber;
        operator = button;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.multiplication = function (button) {
        number = currentNumber;
        operator = button;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(currentNumber);
    };

    Calculator.prototype.subtraction = function (button) {
        number = currentNumber;
        operator = button;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(number + operator);
    };

    Calculator.prototype.addition = function (button) {
        number = currentNumber;
        operator = button;

        this.updateHistoryScreen(this.updateHistory(button));
        this.updateMainScreen(number + operator);
    };

    Calculator.prototype.save = function (history, result) {
        let database = firebase.database();

        database.ref('task').push({
            question: history,
            result: result,
            time: new Date().getTime()
        });
    };

    Calculator.prototype.solve = function () {
        for (let i=0; i<stack.length + 1; i++) {
            let data = stack.pop();

            switch (data.operator) {
                case '+':
                    currentNumber = Number(data.number) + Number(currentNumber);
                    break;
                case '-':
                    currentNumber = Number(data.number) - Number(currentNumber);
                    break;
            }
        }

        result = currentNumber;

        this.updateMainScreen(result);
        this.save(history, result);

        console.log('Save question and result');
    };

    Calculator.prototype.run = function (button) {
        switch (button) {
            case '.':    this.dot(button); break;
            case '+':    this.addition(button); break;
            case '-':    this.subtraction(button); break;
            case '*':    this.multiplication(button); break;
            case '/':    this.division(button); break;
            case 'sqr':  this.sqr(button); break;
            case 'sqrt': this.sqrt(button); break;
            case '1/x':  this.fraction(button); break;
            case '%':    this.percentage(button); break;
            case 'C':
            case 'CE':   this.init(); break;
            case 'CS':   this.clearSymbol(button); break;
            case '=':    this.solve(); break;
            default:     this.handler(button); break;
        }
    };

    Array.prototype.forEach.call(document.querySelectorAll('.button'), function (button) {
        button.addEventListener('click', function (element) {
            calc.run(element.currentTarget.getAttribute('data-value'));
        });
    });

    $.fn.calculator = function () {
        return new Calculator();
    };

    $(document).ready(function () {
        calc = new Calculator();

        calc.init();
    });
})(jQuery, window, document);