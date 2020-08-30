function getUrl(itemName, itemVal) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const hasItem = params.get(itemName);
  if (hasItem) {
    params.set(itemName, itemVal);
  } else {
    params.append(itemName, itemVal);
  }
  return url.href;
}

$(document).ready(() => {
  /* loading */
  $('body').css('overflow', 'hidden');
  $(window).on('load', () => {
    setTimeout(() => {
      $('.loading').fadeOut();
      $('body').css('overflow', 'auto');
    }, 200);
  });

  /* alertmessage */
  setTimeout(() => {
    $('.alertmessage').hide();
  }, 2500);

  /* Modal */

  // 關閉 Modal
  $('.js-closeModal').on('click', (e) => {
    e.preventDefault();
    $('.modal').modal('hide');
  });

  // 開啟 Modal
  $('.js-openModal').on('click', (e) => {
    e.preventDefault();

    const node = $(e.target).closest('a').length > 0 ? $(e.target).closest('a') : $(e.target);
    const ref = node.data('ref');
    const id = node.data('id');
    const title = node.data('title');

    $('.modal-body').text(`確定要刪除  ${title} ?`);
    $('.js-deleteBtn').attr('data-id', id);
    $('.js-deleteBtn').attr('data-ref', ref);

    $('.modal').modal('show');
  });

  // Modal 按確認鍵 刪除
  $('.js-deleteBtn').on('click', (e) => {
    e.preventDefault();

    const ref = $(e.target).data('ref');
    const id = $(e.target).data('id');

    let url = '';
    let to = '';

    switch (ref) {
      case 'article':
        url = `/article/delete/${id}`;
        break;
      case 'categories':
        url = `/editcategories/delete/${id}`;
        break;
      case 'user':
        url = '/user/delete';
        to = '/auth/signin';
        break;
      default:
        url = '';
        to = '';
        break;
    }

    $.ajax({
      url,
      method: 'DELETE',
    }).done(() => {
      if (ref === 'user') {
        window.location = to;
      } else {
        window.location.reload();
      }

      $('.modal').modal('hide');
    });
  });

  /* index 頁面 */

  // mode

  // 監聽 列表顯示按鈕
  $('.js-arrange').on('click', (e) => {
    e.preventDefault();
    const arrange = $(e.target).closest('a').data('arrange');
    const url = getUrl('arrange', arrange);
    window.location = url;
  });

  /* star */

  // 顯示星號筆記/顯示全部筆記
  $('.js-show').on('click', (e) => {
    e.preventDefault();
    const star = $(e.target).closest('a').data('show');
    const url = getUrl('star', star);
    window.location = url;
  });

  // 收藏筆記
  $('.js-star').on('click', (e) => {
    e.preventDefault();
    const articleId = $(e.target).closest('a').data('articleid');

    $.ajax({
      url: `/star/update/${articleId}`,
      method: 'PUT',
    }).done(() => {
      window.location.reload();
    });
  });

  /* edit-article 頁面 */

  // 預設 - 使用預設圖片
  let coverInfo = 'default';

  if ($('.js-originalImg').length > 0) {
    coverInfo = 'original';
  }

  // 監聽 上傳檔案按鈕
  $('.js-uploadImg').on('change', (e) => {
    const img = e.target.files[0];
    const originalImgName = $(e.target).data('originalImgName');
    const originalImgUrl = $(e.target).data('originalImgUrl');

    // 沒有上傳檔案
    if (!img) {
      const imgName = originalImgName || '已使用預設圖片';
      const imgUrl = originalImgUrl || '/images/cover.png';
      coverInfo = originalImgName ? 'original' : 'default';

      $('.js-uploadText').removeClass('text-danger').text(imgName);
      $('.js-uploadThumbnail').attr('src', imgUrl);
    // 當上傳的檔案大於 3mb
    } else if (img.size > 3 * 1024 * 1024) {
      const imgName = originalImgName ? `檔案已超過 3MB，請重新上傳，目前已使用 ${originalImgName}` : '檔案已超過 3MB，請重新上傳，已使用預設圖片';
      const imgUrl = originalImgUrl || '/images/cover.png';
      coverInfo = originalImgName ? 'original' : 'default';

      $('.js-uploadText').addClass('text-danger').text(imgName);
      $('.js-uploadImg').val('');
      $('.js-uploadThumbnail').attr('src', imgUrl);
    // 新增檔案成功
    } else {
      const imgName = img.name;
      const url = URL.createObjectURL(img);
      $('.js-uploadText').removeClass('text-danger').text(imgName);
      $('.js-uploadThumbnail').attr('src', url);
      coverInfo = 'new';
    }
  });

  // 點選使用預設圖片
  $('.js-initImg').on('click', (e) => {
    e.preventDefault();

    $('.js-uploadImg').val('');
    $('.js-uploadText').removeClass('text-danger').text('已使用預設圖片');
    $('.js-uploadThumbnail').attr('src', '/images/cover.png');
    coverInfo = 'default';
  });

  // 還原上次上傳的封面圖片
  $('.js-originalImg').on('click', (e) => {
    e.preventDefault();

    const originalImgName = $(e.target).data('originalImgName');
    const originalImgUrl = $(e.target).data('originalImgUrl');

    $('.js-uploadImg').val('');
    $('.js-uploadText').removeClass('text-danger').text(originalImgName);
    $('.js-uploadThumbnail').attr('src', originalImgUrl);
    coverInfo = 'original';
  });

  // 送出資料
  $('.js-sendBtn').on('click', (e) => {
    e.preventDefault();
    const form = $('.articleForm')[0];
    const formData = new FormData(form);

    // 把 formdata 重新指向 ckeditor 內容
    // eslint-disable-next-line no-undef
    const content = CKEDITOR.instances.content.getData();
    formData.set('content', content);

    let path = '/article/create';
    const articleId = $(e.target).data('articleid');
    if (articleId) {
      path = `/article/update/${articleId}`;
      // 若是更新文章則 加入圖片使用資訊
      formData.append('coverInfo', coverInfo);
    }

    $.ajax({
      url: path,
      method: 'POST',
      processData: false,
      contentType: false,
      data: formData,
    }).done((response) => {
      if (response.success) {
        window.location = '/';
      } else {
        window.location.reload();
      }
    });
  });

  /* user setting */

  // 更新密碼/暱稱
  $('.js-updateUser').on('click', (e) => {
    e.preventDefault();
    const node = $(e.target).parent().prev().find('input');
    const name = node.attr('name');
    const data = node.val().trim();
    if (data) {
      $.ajax({
        url: `/user/update/${name}`,
        method: 'POST',
        data: { data },
      }).done(() => {
        window.location.reload();
      });
    }
  });
});
