from django.core.management.base import BaseCommand

from badges.import_utils import run_import


class Command(BaseCommand):
    help = "Import approved badge requirements from an Excel spreadsheet."

    def add_arguments(self, parser):
        parser.add_argument("xlsx", help="Path to the .xlsx badge record file")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be imported without writing to the database",
        )

    def handle(self, *args, **options):
        xlsx_path = options["xlsx"]
        dry_run = options["dry_run"]

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no database changes will be made.\n"))

        result = run_import(xlsx_path, dry_run=dry_run)

        if "error" in result:
            self.stderr.write(self.style.ERROR(f"Error: {result['error']}"))
            return

        self.stdout.write(f"Processed rows:    {result['processed']}")
        self.stdout.write(f"Approved rows:     {result['approved_rows']}")
        self.stdout.write(
            self.style.SUCCESS(f"Created:           {result['created']}")
            if result["created"] else f"Created:           {result['created']}"
        )
        self.stdout.write(f"Already existed:   {result['already_existed']}")

        warnings = result["warnings"]
        if warnings["scout_not_found"]:
            self.stdout.write(self.style.WARNING(
                f"\nScouts not found ({len(warnings['scout_not_found'])}):"
            ))
            for name in warnings["scout_not_found"]:
                self.stdout.write(f"  - {name}")

        if warnings["badge_prefix_not_found"]:
            self.stdout.write(self.style.WARNING(
                f"\nUnknown badge prefixes ({len(warnings['badge_prefix_not_found'])}):"
            ))
            for name in warnings["badge_prefix_not_found"]:
                self.stdout.write(f"  - {name}")

        if warnings["requirement_not_found"]:
            self.stdout.write(self.style.WARNING(
                f"\nRequirements not found ({len(warnings['requirement_not_found'])}):"
            ))
            for title in warnings["requirement_not_found"]:
                self.stdout.write(f"  - {title}")

        if warnings["reviewer_not_found"]:
            self.stdout.write(self.style.WARNING(
                f"\nReviewers not found (set to None) ({len(warnings['reviewer_not_found'])}):"
            ))
            for name in warnings["reviewer_not_found"]:
                self.stdout.write(f"  - {name}")
