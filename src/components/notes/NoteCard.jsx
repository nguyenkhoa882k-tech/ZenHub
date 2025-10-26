import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const { width } = Dimensions.get('window');

const NoteCard = ({
  note,
  viewMode = 'list',
  isSelected = false,
  selectionMode = false,
  onPress,
  onLongPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selectionAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm nay';
    } else if (diffDays === 2) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getContentPreview = content => {
    if (!content) return 'Không có nội dung...';

    // Check if it's a checklist
    const isChecklist = /^\s*- \[[ x]\]/m.test(content);

    if (isChecklist) {
      const lines = content.split('\n');
      const checklistItems = lines
        .filter(line => line.trim().match(/^\s*- \[[ x]\]/))
        .slice(0, viewMode === 'grid' ? 2 : 3);

      const completedCount = checklistItems.filter(item =>
        item.includes('[x]'),
      ).length;
      const totalCount = lines.filter(line =>
        line.trim().match(/^\s*- \[[ x]\]/),
      ).length;

      const itemsText = checklistItems
        .map(item => item.replace(/^\s*- \[[ x]\]\s*/, ''))
        .join(', ');

      return `${itemsText}${
        totalCount > checklistItems.length ? '...' : ''
      } (${completedCount}/${totalCount})`;
    }

    // Remove markdown syntax for preview
    const cleaned = content
      .replace(/#+\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim();

    return cleaned.length > (viewMode === 'grid' ? 80 : 120)
      ? cleaned.substring(0, viewMode === 'grid' ? 80 : 120) + '...'
      : cleaned;
  };

  const isChecklist = content => {
    return content && /^\s*- \[[ x]\]/m.test(content);
  };

  const getChecklistPreview = content => {
    if (!isChecklist(content)) return [];

    const lines = content.split('\n');
    return lines
      .filter(line => line.trim().match(/^\s*- \[[ x]\]/))
      .slice(0, viewMode === 'grid' ? 2 : 3)
      .map(line => ({
        text: line.replace(/^\s*- \[[ x]\]\s*/, ''),
        completed: line.includes('[x]'),
      }));
  };

  const getChecklistStats = content => {
    if (!isChecklist(content)) return { completed: 0, total: 0 };

    const lines = content.split('\n');
    const checklistLines = lines.filter(line =>
      line.trim().match(/^\s*- \[[ x]\]/),
    );
    const completed = checklistLines.filter(line =>
      line.includes('[x]'),
    ).length;

    return { completed, total: checklistLines.length };
  };

  const renderTags = () => {
    if (!note.tags || note.tags.length === 0) return null;

    const maxTags = viewMode === 'grid' ? 2 : 3;
    const displayTags = note.tags.slice(0, maxTags);
    const remainingCount = note.tags.length - maxTags;

    return (
      <View style={styles.tagsContainer}>
        {displayTags.map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: tag.color + '20' }]}
          >
            <Text style={[styles.tagText, { color: tag.color }]}>
              {tag.name}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.tag, styles.tagMore]}>
            <Text style={styles.tagMoreText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderBadges = () => {
    const badges = [];

    if (note.pinned === 1) {
      badges.push(
        <View key="pinned" style={[styles.badge, styles.pinnedBadge]}>
          <Icon name="bookmark" size={12} color={NOTES_CONFIG.COLORS.WARNING} />
        </View>,
      );
    }

    if (note.due_date) {
      const dueDate = new Date(note.due_date);
      const now = new Date();
      const isOverdue = dueDate < now;

      badges.push(
        <View
          key="due"
          style={[
            styles.badge,
            isOverdue ? styles.overdueBadge : styles.dueBadge,
          ]}
        >
          <Icon
            name="time"
            size={12}
            color={
              isOverdue ? NOTES_CONFIG.COLORS.ERROR : NOTES_CONFIG.COLORS.INFO
            }
          />
        </View>,
      );
    }

    if (note.template_id) {
      badges.push(
        <View key="template" style={[styles.badge, styles.templateBadge]}>
          <Icon name="copy" size={12} color={NOTES_CONFIG.COLORS.SUCCESS} />
        </View>,
      );
    }

    return badges.length > 0 ? (
      <View style={styles.badgesContainer}>{badges}</View>
    ) : null;
  };

  const cardStyle = viewMode === 'grid' ? styles.gridCard : styles.listCard;

  return (
    <Animated.View
      style={[
        cardStyle,
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
        isSelected && styles.selectedCard,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardContent}
      >
        {/* Selection indicator */}
        {selectionMode && (
          <Animated.View
            style={[
              styles.selectionIndicator,
              {
                opacity: selectionAnim,
                transform: [
                  {
                    scale: selectionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={
                isSelected
                  ? NOTES_CONFIG.COLORS.SUCCESS
                  : NOTES_CONFIG.COLORS.BORDER
              }
            />
          </Animated.View>
        )}

        {/* Card color indicator */}
        {note.color && (
          <View
            style={[styles.colorIndicator, { backgroundColor: note.color }]}
          />
        )}

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[styles.title, viewMode === 'grid' && styles.gridTitle]}
              numberOfLines={viewMode === 'grid' ? 2 : 1}
            >
              {note.title || 'Ghi chú không có tiêu đề'}
            </Text>
            {renderBadges()}
          </View>

          {/* Content preview */}
          <View style={styles.contentContainer}>
            {isChecklist(note.content) ? (
              <View style={styles.checklistPreview}>
                {getChecklistPreview(note.content).map((item, index) => (
                  <View key={index} style={styles.checklistItem}>
                    <View
                      style={[
                        styles.checklistCheckbox,
                        item.completed && styles.checklistCheckboxCompleted,
                      ]}
                    >
                      {item.completed && (
                        <Icon name="checkmark" size={8} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checklistText,
                        item.completed && styles.checklistTextCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))}
                {getChecklistStats(note.content).total > 3 && (
                  <Text style={styles.checklistMore}>
                    +{getChecklistStats(note.content).total - 3} mục khác
                  </Text>
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.content,
                  viewMode === 'grid' && styles.gridContent,
                ]}
                numberOfLines={viewMode === 'grid' ? 3 : 2}
              >
                {getContentPreview(note.content)}
              </Text>
            )}
          </View>

          {/* Tags */}
          {renderTags()}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.metadata}>
              <Icon
                name="time-outline"
                size={14}
                color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
              />
              <Text style={styles.date}>{formatDate(note.updated_at)}</Text>
            </View>

            {/* Board column indicator for kanban */}
            {note.board_column && note.board_column !== 'inbox' && (
              <View
                style={[
                  styles.boardIndicator,
                  {
                    backgroundColor:
                      NOTES_CONFIG.BOARD_COLUMNS.find(
                        col => col.id === note.board_column,
                      )?.color || NOTES_CONFIG.COLORS.TEXT_SECONDARY,
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Action button for list view */}
        {viewMode === 'list' && !selectionMode && (
          <View style={styles.actionButton}>
            <Icon
              name="chevron-forward"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: NOTES_CONFIG.UI.CARD_BORDER_RADIUS,
    marginBottom: 12,
    shadowColor: NOTES_CONFIG.COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  gridCard: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: NOTES_CONFIG.UI.CARD_BORDER_RADIUS,
    width: (width - 48) / 2,
    minHeight: NOTES_CONFIG.UI.GRID_ITEM_HEIGHT,
    shadowColor: NOTES_CONFIG.COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  selectedCard: {
    borderColor: NOTES_CONFIG.COLORS.SUCCESS,
    borderWidth: 2,
    shadowColor: NOTES_CONFIG.COLORS.SUCCESS,
    shadowOpacity: 0.2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  colorIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  gridTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    lineHeight: 20,
  },
  content: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 12,
  },
  gridContent: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    fontWeight: '500',
  },
  tagMore: {
    backgroundColor: NOTES_CONFIG.COLORS.BORDER,
  },
  tagMoreText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  pinnedBadge: {
    backgroundColor: NOTES_CONFIG.COLORS.WARNING + '20',
  },
  dueBadge: {
    backgroundColor: NOTES_CONFIG.COLORS.INFO + '20',
  },
  overdueBadge: {
    backgroundColor: NOTES_CONFIG.COLORS.ERROR + '20',
  },
  templateBadge: {
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS + '20',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  boardIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  checklistPreview: {
    gap: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checklistCheckboxCompleted: {
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS,
    borderColor: NOTES_CONFIG.COLORS.SUCCESS,
  },
  checklistText: {
    flex: 1,
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 16,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  checklistMore: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default NoteCard;
