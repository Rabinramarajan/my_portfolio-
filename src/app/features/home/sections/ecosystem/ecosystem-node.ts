import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { EcosystemNode } from '../../../../core/models/portfolio.models';

/**
 * Individual technology node in the engineering constellation.
 *
 * Positioned absolutely within the constellation canvas using CSS custom
 * properties derived from polar coordinates. Visual emphasis varies by tier:
 *   • primary   → lime monogram marker + strong text
 *   • secondary → outlined circle + standard text
 *   • supporting → small dot + muted text
 */
@Component({
  selector: 'app-ecosystem-node',
  templateUrl: './ecosystem-node.html',
  styleUrl: './ecosystem-node.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-active]': 'isActive()',
    '[class.is-related]': 'isRelated()',
    '[class.is-muted]': 'isMuted()',
    '[attr.data-tier]': 'node().tier',
    '[style.--node-x]': 'position().x',
    '[style.--node-y]': 'position().y',
    '(mouseenter)': 'hovered.emit(node().id)',
    '(mouseleave)': 'hovered.emit(null)',
    '(click)': 'selected.emit(node().id)',
    '(keydown.enter)': 'selected.emit(node().id)',
    '(keydown.space)': 'selected.emit(node().id)',
    '[attr.tabindex]': '0',
    '[attr.role]': '"button"',
    '[attr.aria-label]': 'node().name',
  },
})
export class EcosystemNodeComponent {
  readonly node = input.required<EcosystemNode>();
  readonly isActive = input(false);
  readonly isRelated = input(false);
  readonly isMuted = input(false);

  readonly hovered = output<string | null>();
  readonly selected = output<string>();

  /**
   * Converts polar (angle, radius) to percentage-based CSS coordinates.
   * Angle 0° = top, clockwise. Center of canvas is at 50% 50%.
   */
  protected readonly position = computed(() => {
    const { angle, radius } = this.node();
    const rad = ((angle - 90) * Math.PI) / 180;
    const x = `${50 + radius * 50 * Math.cos(rad)}%`;
    const y = `${50 + radius * 50 * Math.sin(rad)}%`;
    return { x, y };
  });
}
