import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  header: string;
  key: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table class="table" role="table">
        <thead>
          <tr role="row">
            @for (col of columns; track col.key) {
              <th [attr.scope]="'col'" class="table-header" [class.sortable]="col.sortable">
                {{ col.header }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          <ng-content />
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--r-md);

      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);

        thead {
          background: var(--surface-hover);
          border-bottom: 1px solid var(--border);
        }

        .table-header {
          padding: var(--sp-4);
          text-align: left;
          font-weight: var(--fw-semibold);
          color: var(--text);

          &.sortable {
            cursor: pointer;
            user-select: none;

            &:hover {
              background: var(--border);
            }
          }
        }

        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background var(--dur-fast) var(--ease-out);

          &:hover {
            background: rgba(110 86 207 / 0.05);
          }

          td {
            padding: var(--sp-4);
            color: var(--text);
          }
        }
      }
    }
  `],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
}

@Component({
  selector: 'app-table-row',
  standalone: true,
  template: `<tr role="row"><ng-content /></tr>`,
})
export class TableRowComponent {}

@Component({
  selector: 'app-table-cell',
  standalone: true,
  template: `<td><ng-content /></td>`,
})
export class TableCellComponent {}
