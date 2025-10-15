import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const Card = ({
  children,
  className = '',
  onPress = null,
  pressable = false,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-card shadow-sm';
  const combinedClasses = `${baseClasses} ${className}`;

  if (pressable || onPress) {
    return (
      <TouchableOpacity
        className={combinedClasses}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClasses} {...props}>
      {children}
    </View>
  );
};

const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <View className={`flex-row items-center justify-between p-4 ${className}`}>
    <View className="flex-1">
      <Text className="text-warm-900 font-semibold text-lg">{title}</Text>
      {subtitle && (
        <Text className="text-warm-600 text-sm mt-1">{subtitle}</Text>
      )}
    </View>
    {action && <View>{action}</View>}
  </View>
);

const CardContent = ({ children, className = '' }) => (
  <View className={`px-4 pb-4 ${className}`}>{children}</View>
);

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon = null,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return disabled
          ? 'bg-warm-300'
          : 'bg-primary-500 active:bg-primary-600';
      case 'secondary':
        return disabled
          ? 'bg-warm-200 border border-warm-300'
          : 'bg-secondary-500 active:bg-secondary-600';
      case 'outline':
        return disabled
          ? 'border border-warm-300'
          : 'border border-primary-500 active:bg-primary-50';
      case 'ghost':
        return disabled ? '' : 'active:bg-warm-100';
      default:
        return 'bg-primary-500 active:bg-primary-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2';
      case 'medium':
        return 'px-4 py-3';
      case 'large':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextClasses = () => {
    const baseText = 'font-semibold text-center';

    if (disabled) {
      return `${baseText} text-warm-500`;
    }

    switch (variant) {
      case 'outline':
        return `${baseText} text-primary-500`;
      case 'ghost':
        return `${baseText} text-warm-700`;
      default:
        return `${baseText} text-white`;
    }
  };

  return (
    <TouchableOpacity
      className={`
        rounded-xl flex-row items-center justify-center
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      {icon && (
        <View className={title ? 'mr-2' : ''}>
          <Icon
            name={icon}
            size={20}
            color={
              variant === 'outline' || variant === 'ghost'
                ? '#d18843'
                : '#ffffff'
            }
          />
        </View>
      )}
      {title && <Text className={getTextClasses()}>{title}</Text>}
    </TouchableOpacity>
  );
};

const BadgeContent = ({ text, variant, removable, onRemove }) => {
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary-800';
      case 'secondary':
        return 'text-secondary-800';
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-warm-800';
    }
  };

  return (
    <View className="flex-row items-center">
      <Text className={`text-xs font-medium ${getTextColor()}`}>{text}</Text>
      {removable && onRemove && (
        <TouchableOpacity
          className="ml-1"
          onPress={onRemove}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Icon name="close" size={12} color="#78716c" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const Badge = ({
  text,
  variant = 'default',
  className = '',
  onPress = null,
  removable = false,
  onRemove = null,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-100';
      case 'secondary':
        return 'bg-secondary-100';
      case 'success':
        return 'bg-green-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-warm-100';
    }
  };

  const containerClasses = `
    px-2 py-1 rounded-full ${getVariantClasses()} ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity className={containerClasses} onPress={onPress}>
        <BadgeContent
          text={text}
          variant={variant}
          removable={removable}
          onRemove={onRemove}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View className={containerClasses}>
      <BadgeContent
        text={text}
        variant={variant}
        removable={removable}
        onRemove={onRemove}
      />
    </View>
  );
};

const EmptyState = ({ icon, title, description, action, className = '' }) => (
  <View className={`items-center justify-center py-12 px-6 ${className}`}>
    {icon && (
      <View className="bg-warm-100 rounded-full p-4 mb-4">
        <Icon name={icon} size={48} color="#78716c" />
      </View>
    )}
    <Text className="text-warm-800 font-semibold text-xl text-center mb-2">
      {title}
    </Text>
    {description && (
      <Text className="text-warm-600 text-center text-base mb-6 leading-6">
        {description}
      </Text>
    )}
    {action && action}
  </View>
);

const LoadingSpinner = ({
  size = 'medium',
  color = '#d18843',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'medium':
        return 'w-8 h-8';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <View className={`${getSizeClasses()} ${className}`}>
      <Icon
        name="reload"
        size={size === 'small' ? 16 : size === 'large' ? 48 : 32}
        color={color}
      />
    </View>
  );
};

export {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  EmptyState,
  LoadingSpinner,
};
