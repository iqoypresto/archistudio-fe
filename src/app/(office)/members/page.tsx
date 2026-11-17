import { PageHeader } from "@/components/ui/PageHeader";
import { MemberContent } from "@/components/office/member/MemberContent";

export const instant = false;

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Anggota Tim"
        description="Kelola akun internal, peran pengguna, pengaturan kata sandi, dan status aktif operasional."
      />
      <MemberContent />
    </div>
  );
}
