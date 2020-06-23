let magicCount = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function esc(param) {
  return encodeURIComponent(param)
    .replace(/[!'()]/g, escape)
    .replace(/%20/g, '+');
};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

function cleanArray(actual) {
  let newArray = new Array();
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
};

function httpBuildQuery(queryData, numericPrefix, argSeparator, tempKey) {
  numericPrefix = numericPrefix || null;
  argSeparator = argSeparator || '&';
  tempKey = tempKey || null;
  if (!queryData) {
    return '';
  }
  let query = Object.keys(queryData).map(function (k) {
    let res;
    let key = k;
    if (tempKey) {
      key = tempKey + '[' + key + ']';
    }
    if (typeof queryData[k] === 'object' && queryData[k] !== null) {
      res = httpBuildQuery(queryData[k], null, argSeparator, key);
    } else {
      if (numericPrefix) {
        key = isNumeric(key) ? numericPrefix + Number(key) : key;
      }
      let val = queryData[k];
      val = val === true ? '1' : val;
      val = val === false ? '0' : val;
      val = val === 0 ? '0' : val;
      val = val || '';
      res = esc(key) + '=' + esc(val);
    }
    return res;
  });
  return cleanArray(query)
    .join(argSeparator)
    .replace(/[!'()]/g, '');
};

async function getFile(url) {
  const d = await fetch(url);
  return await d.json();
}

export async function executeREST(method, params) {
  try {
    magicCount++;
    if (magicCount == 2) {
      await sleep(1000);
      magicCount = 0;
    }
    const queryUrl = `https://b24-7jxc9k.bitrix24.ru/rest/1/rcdql0q1jq2qve09/${method}.json`;
    const queryData = httpBuildQuery(params);
    let data = await getFile(`${queryUrl}?${queryData}`);
    return data;
  } finally {
    console.log('Получены данные из CRM');
  }
};

export async function getList(method, params) {
  let total = await executeREST(method, params);
  let calls = Math.ceil(total['total'] / 50);
  let current_call = 0;
  let batch = [];
  let result = [];
  let list = [];
  do {
    current_call++;
    batch['get_' + current_call] =
      method + '?' + httpBuildQuery(
        Object.assign({
            "start": (current_call - 1) * 50
          },
          params
        )
      );
    if (batch.length == 50 || current_call == calls) {
      let batch_result = await executeREST('batch', {
        'cmd': batch
      });
      result = result.concat(batch_result['result']['result']);
      batch = [];
    }
  } while (current_call < calls);

  result.forEach(res => {
    for (const get in res) {
      list = list.concat(res[get]);
    }
  });
  return list;
}