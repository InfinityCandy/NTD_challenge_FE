export const stringToDate = (str) => {
  if (str === "*") {
    return new Date(str);
  }

  const [month, year] = str.split("-");
  return new Date(`${month} 1 20${year}`);
};

export const dateToString = (d) => {
  if (isNaN(d.valueOf())) {
    return "*";
  }

  const [_, month, __, year] = d.toString().split(" ");
  return `${month.toUpperCase()}-${year.slice(2, 4)}`;
};

export const parseCSV = (str) => {
  let [headers, ...lines] = str.split(";\n");

  headers = headers.split(";");

  return lines.map((line) => {
    return line.split(";").reduce((acc, value, i) => {
      if (["ACCOUNT", "DEBIT", "CREDIT"].includes(headers[i])) {
        acc[headers[i]] = parseInt(value, 10);
      } else if (headers[i] === "PERIOD") {
        acc[headers[i]] = stringToDate(value);
      } else {
        acc[headers[i]] = value;
      }
      return acc;
    }, {});
  });
};

export const toCSV = (arr) => {
  let headers = Object.keys(arr[0]).join(";");
  let lines = arr.map((obj) => Object.values(obj).join(";"));
  return [headers, ...lines].join(";\n");
};

export const parseUserInput = (str) => {
  const [startAccount, endAccount, startPeriod, endPeriod, format] =
    str.split(" ");

  return {
    startAccount: parseInt(startAccount, 10),
    endAccount: parseInt(endAccount, 10),
    startPeriod: stringToDate(startPeriod),
    endPeriod: stringToDate(endPeriod),
    format,
  };
};

export const calculateBalance = (filtered_journal) => {
  const balance = [];
  filtered_journal.forEach((entry) => {
    const { ACCOUNT, DEBIT, CREDIT } = entry;
    const BALANCE_DELTA = DEBIT - CREDIT;

    const existingEntry = balance.find((b) => b.ACCOUNT === ACCOUNT);

    if (existingEntry) {
      existingEntry.DEBIT += DEBIT;
      existingEntry.CREDIT += CREDIT;
      existingEntry.BALANCE += BALANCE_DELTA;
    } else {
      balance.push({
        ACCOUNT,
        DEBIT,
        CREDIT,
        BALANCE: BALANCE_DELTA,
      });
    }
  });
  return balance;
};

export const filterJournal = (journalEntries, userInput) => {
  const journalLength = journalEntries.length;

  return journalEntries.filter((entry) => {
    const startPeriod = isNaN(userInput.startPeriod)
      ? journalEntries[0].PERIOD
      : userInput.startPeriod;

    const endPeriod = isNaN(userInput.endPeriod)
      ? journalEntries[journalLength - 1].PERIOD
      : userInput.endPeriod;

    return entry.PERIOD >= startPeriod && entry.PERIOD <= endPeriod;
  });
};

export const filterAccounts = (accounts, userInput) => {
  const accountsLength = accounts.length;

  const filteredAccounts = accounts.filter((account) => {
    const startAccount = isNaN(userInput.startAccount)
      ? accounts[0].ACCOUNT
      : userInput.startAccount;
    const endAccount = isNaN(userInput.endAccount)
      ? accounts[accountsLength - 1].ACCOUNT
      : userInput.endAccount;

    return account.ACCOUNT >= startAccount && account.ACCOUNT <= endAccount;
  });

  return filteredAccounts;
};
