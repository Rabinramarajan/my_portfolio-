import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GlassCard } from '../../ui/glass-card/glass-card';
import { Badge } from '../../ui/badge/badge';
import { BlogPost } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

/** Blog article card — cover with category badge, title, excerpt, meta, arrow. */
@Component({
  selector: 'app-blog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, Icon, GlassCard, Badge],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
  host: { class: 'block' },
})
export class BlogCard {
  readonly post = input.required<BlogPost>();
}
