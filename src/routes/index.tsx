import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import Table from '~/components/starter/table/table';

export default component$(() => {
  return (
    <>
      <div class="container mx-auto px-3">
        <Table />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Bảng tính giá cước tiền điện',
  meta: [
    {
      name: 'description',
      content: 'Bảng tính giá cước tiền điện - made by Thomas Nguyen',
    },
  ],
};
