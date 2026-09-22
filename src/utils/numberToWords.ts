/**
 * Converts Indian Rupee amounts into clean English words for statutory invoices.
 */
export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(num: number): string {
    if (num < 20) return singleDigits[num];
    const tensDigit = Math.floor(num / 10);
    const onesDigit = num % 10;
    return `${tens[tensDigit]}${onesDigit > 0 ? ' ' + singleDigits[onesDigit] : ''}`;
  }

  function convertThreeDigits(num: number): string {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let res = '';
    if (hundreds > 0) {
      res += `${singleDigits[hundreds]} Hundred`;
      if (rest > 0) res += ' and ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  let num = rounded;
  let words = '';

  const crores = Math.floor(num / 10000000);
  num %= 10000000;

  const lakhs = Math.floor(num / 100000);
  num %= 100000;

  const thousands = Math.floor(num / 1000);
  num %= 1000;

  const remaining = num;

  if (crores > 0) {
    words += `${convertThreeDigits(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${convertThreeDigits(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${convertThreeDigits(thousands)} Thousand `;
  }
  if (remaining > 0) {
    words += convertThreeDigits(remaining);
  }

  return `Rupees ${words.trim()} Only`;
}
