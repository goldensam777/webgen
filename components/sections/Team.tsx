import React from "react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatarSrc?: string;
}

interface TeamProps {
  title?: string;
  subtitle?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  nameColor?: string;
  roleColor?: string;
  bioColor?: string;
  avatarBgColor?: string;
  avatarTextColor?: string;
}

export function Team({
  title,
  subtitle,
  members = [],
  columns = 3,
  bgColor = "bg-gray-50",
  titleColor = "text-gray-900",
  subtitleColor = "text-gray-500",
  cardBgColor = "bg-white",
  cardBorderColor = "border-gray-200",
  nameColor = "text-gray-900",
  roleColor = "text-blue-600",
  bioColor = "text-gray-500",
  avatarBgColor = "bg-blue-100",
  avatarTextColor = "text-blue-700",
}: TeamProps) {
  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`${bgColor} py-20 px-6`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && <h2 className={`text-3xl md:text-4xl font-bold ${titleColor}`}>{title}</h2>}
            {subtitle && <p className={`mt-4 text-lg max-w-2xl mx-auto ${subtitleColor}`}>{subtitle}</p>}
          </div>
        )}

        <div className={`grid gap-6 ${colStyles[columns]}`}>
          {members.map((member, i) => (
            <Card
              key={i}
              bgColor={cardBgColor}
              borderColor={cardBorderColor}
              shadow="sm"
              className="flex flex-col items-center text-center"
            >
              <Avatar
                src={member.avatarSrc}
                initials={member.name}
                size="xl"
                bgColor={avatarBgColor}
                textColor={avatarTextColor}
              />
              <h3 className={`mt-4 font-semibold text-base ${nameColor}`}>{member.name}</h3>
              <p className={`text-sm font-medium ${roleColor}`}>{member.role}</p>
              {member.bio && (
                <p className={`mt-2 text-sm leading-relaxed ${bioColor}`}>{member.bio}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
