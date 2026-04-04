import Badge from '../ui/Badge';

interface Props {
  skillName: string;
  requiredLevel?: number;
  userLevel?: number;
}

export default function SkillMatchIndicator({ skillName, requiredLevel, userLevel }: Props) {
  const matched = userLevel && requiredLevel && userLevel >= requiredLevel;
  const partial = userLevel && requiredLevel && userLevel > 0 && userLevel < requiredLevel;

  return (
    <Badge variant={matched ? 'success' : partial ? 'warning' : 'error'}>
      {skillName} {requiredLevel && `(${requiredLevel})`}
    </Badge>
  );
}
