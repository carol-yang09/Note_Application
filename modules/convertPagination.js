const currentPagination = (articles, currentPage, path) => {
  // 總共幾筆資料
  const totalResult = articles.length;
  // 每頁幾筆資料
  const perpage = 6;
  // 總共幾頁
  const pageTotal = Math.ceil(totalResult / perpage);
  // 所在頁數不能比總頁數大
  if (currentPage > pageTotal) {
    // eslint-disable-next-line no-param-reassign
    currentPage = pageTotal;
  }
  // 此頁碼最小資料為第?筆
  const minItem = (currentPage * perpage) - perpage + 1;
  // 此頁碼最大資料為第?筆
  const maxItem = currentPage * perpage;

  const data = [];
  // 只取當前頁面資料
  articles.forEach((item, i) => {
    // 配合  minItem 及  maxItem 從 1 開始，所以 +1
    const itemNum = i + 1;
    // 每頁 3 筆，以第 2 頁為例，只取第 4~6 筆
    if (itemNum >= minItem && itemNum <= maxItem) {
      data.push(item);
    }
  });

  const page = {
    pageTotal,
    currentPage,
    hasPre: currentPage > 1,
    hasNext: currentPage < pageTotal,
    path,
  };

  return {
    page,
    data,
  };
};

module.exports = currentPagination;
