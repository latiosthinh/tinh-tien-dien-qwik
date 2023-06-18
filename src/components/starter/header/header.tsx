import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <header>
      <div class="container text-center mx-auto pt-5">
        <h1 class="text-2xl font-bold">Bảng tính giá cước sinh hoạt</h1>
        <h2 class="mt-2">
          (Dữ liệu được trích xuất trực tiếp từ <a class="text-blue-700 font-semibold underline" href="https://www.evn.com.vn/c3/calc/Cong-cu-tinh-hoa-don-tien-dien-9-172.aspx" target="_blank">EVN</a>)
        </h2>
      </div>
    </header>
  );
});
