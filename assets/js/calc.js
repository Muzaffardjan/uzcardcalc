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

    let mainScreen = document.querySelector('#main'),
        historyScreen = document.querySelector('#history'),
        result,
        prevResult,
        history,
        currentNumber,
        prevBtn,
        mathOp,
        prevMathOp,
        mathOpCount,
        mathOpPress,
        isInit;
    let stack = [];

    function fraction(val) {
        return 1 / val;
    }

    function square(val) {
        return val * val;
    }

    function squareRoot(val) {
        return Math.sqrt(val);
    }

    function percentage(val, res) {
        return res * val / 100;
    }

    function handler(btn) {
        // return if C wasn't pressed when divide by zero was done
        if (btn !== 'C' && result === 'Result is undefined' || result === 'Cannot divide by zero') {
            return;
        }

        // update history
        if (btn !== '=' && btn !== 'C' && btn !== 'CE' && btn !== 'CS') {
            history = (isNaN(prevBtn) && isNaN(btn))
                ? history.slice(0, -1) + btn
                : history + btn;
        }

        // btn clicked is 'number' or '.'
        if (!isNaN(btn) || btn === '.') {
            if (btn === '.' && /^\d+$/.test(currentNumber)) {
                currentNumber = currentNumber + btn;
            } else if (!isNaN(btn)) {
                currentNumber = (!isNaN(prevBtn) && prevBtn !== null && mainScreen.value !== '0') || prevBtn === '.'
                    ? currentNumber + btn
                    : btn;
            }
            mathOpPress = false;
            updateMainScreen(currentNumber);
            // btn clicked is `Sign`
        } else {
            // update history
            if (btn === '-' || btn === '+' || btn === '*' || btn === '/') {
                // for example, when `-` is pressed, add `0 -` to history screen
                if ((prevBtn === null || prevBtn === '=') && !isInit) {
                    history = '0' + btn;
                    mathOpCount++;
                }

                if (!historyScreen.value.length && mainScreen.value.length) {
                    history = mainScreen.value + btn;
                }
            }

            // if math op was pressed and result is null
            if (mathOp && result === null) {
                result = Number(currentNumber);
            }

            // count percents
            if (btn === '%') {
                history = history.slice(0, -(currentNumber.length + 1));
                currentNumber = percentage(currentNumber, result);
                history += currentNumber + ' ';
                updateMainScreen(currentNumber);
                // count square or square root
            } else if (btn === 'sqr' || btn === 'sqrt' || btn === '1/x') {
                history = history.slice(0, -(currentNumber.length + btn.length)) + (btn === '1/x'
                    ? '1/(' + currentNumber + ') '
                    : btn + '(' + currentNumber + ') ');

                currentNumber = (btn === 'sqr')
                    ? square(currentNumber)
                    : (btn === 'sqrt') ? squareRoot(currentNumber) : fraction(currentNumber);

                updateMainScreen(currentNumber);
                updateHistoryScreen(history);
            }

            // count result
            if (btn === '=') {
                let input_string = history;

                // if math op exists
                if (mathOp) {
                    mathOpCount = 0;
                    // if last button pressed is `mathOperation`
                    // like `+, - etc.` before `=` was pressed
                    if (mathOpPress) {
                        mathOp(prevResult);
                        // if last button pressed is `digit` before `=` was pressed
                    } else {
                        mathOp(Number(currentNumber));
                    }

                    history = '';
                    prevBtn = btn;

                    insertData({
                        question: input_string,
                        result: result
                    });

                    updateMainScreen(result);
                    updateHistoryScreen(history);

                    return;
                }
            }

            // count math ops
            // if sign was pressed and prev btn isn't sign and except some buttons
            if (isNaN(btn) && (!isNaN(prevBtn) || prevBtn === '%' || prevBtn === 'sqr' || prevBtn === 'sqrt' || prevBtn === '1/x') &&
                btn !== '=' && btn !== 'C' && btn !== 'CE' && btn !== 'CS' && btn !== '.' && btn !== '%' && btn !== 'sqr' & btn !== 'sqrt' && btn !== '1/x') {
                mathOpCount++;
            }

            // count result in row
            if (mathOpCount >= 2 && (!isNaN(prevBtn) || prevBtn === 'sqrt' || prevBtn === 'sqr' || prevBtn === '1/x' || prevBtn === '%') && btn !== 'CE' && btn !== 'CS') {
                prevMathOp(Number(currentNumber));
                updateMainScreen(result);
            }

            if (btn === 'CE' && history.length > 0) {
                history = history.slice(0, -(currentNumber.length));
                currentNumber = '0';
                updateMainScreen(0);
            } else if (btn === 'CS') {
                if (result != mainScreen.value) {
                    currentNumber = currentNumber.slice(0, -1);
                    history = history.slice(0, -1);
                    if (!currentNumber.length) {
                        currentNumber = '0';
                    }
                    updateMainScreen(currentNumber);
                } else {
                    return;
                }
            }

            if (result !== null && btn !== 'CE' && btn !== 'CS') {
                updateHistoryScreen(history);
            }
        }

        prevBtn = btn;
        prevResult = result;
        isInit = false;
    }

    function addition(val) {
        result += val;
    }

    function subtraction(val) {
        result -= val;
    }

    function division(val) {
        result /= val;
    }

    function multiplication(val) {
        result *= val;
    }

    function input(btn) {
        // copy prev math op
        if (!isNaN(prevBtn) && btn !== '=' && btn !== 'C' && btn !== 'CE' && btn !== 'CS' && btn !== '.') {
            prevMathOp = mathOp;
        }

        switch (btn) {
            case '+': mathOpPress = true; mathOp = addition; break;
            case '-': mathOpPress = true; mathOp = subtraction; break;
            case '/': mathOpPress = true; mathOp = division; break;
            case '*': mathOpPress = true; mathOp = multiplication; break;
            case 'C': init(); break;
        }

        handler(btn);

        // console.log('Result: ' + result);
        // console.log('Prev result: ' + prevResult);
        // console.log('current number: ' + currentNumber);
        // console.log('btn: ' + btn);
        // console.log('Prev Math Op: ' + prevMathOp);
        // console.log('Math Op Counter: ' + mathOpCount);
        // console.log('Prev btn: '+ prevBtn);
        // console.log('History: ' + history);
        // console.log('Main Screen ' + mainScreen.value);
        // console.log('='.repeat(25) + '>');
    }

    Array.prototype.forEach.call(document.querySelectorAll('.button'), function (btn) {
        btn.addEventListener('click', function (e) {
            let btn = e.currentTarget.getAttribute('data-value');

            input(btn);
        });
    });

    function updateHistoryScreen(history) {
        historyScreen.value = history;
    }

    function updateMainScreen(val) {
        val = String(val);

        if (val.length > 10) {
            mainScreen.style.fontSize = '1.75rem';
            val = Math.round(val * 10000000000000000) / 10000000000000000;
        }

        mainScreen.value = val;
    }

    function init() {
        result = null;
        currentNumber = 0;
        prevBtn = null;
        mathOp = null;
        prevMathOp = null;
        mathOpCount = 0;
        history = '';
        mathOpPress = false;
        isInit = true;
        updateMainScreen(0);
        updateHistoryScreen(history);
    }

    /* Firebase */
    function insertData(data) {
        firebase.database().ref('task').push(data);
    }
    /* Firebase */

    $(document).ready(function () {
        init();
    });
})(jQuery, window, document);