#!/usr/bin/env python
"""Django command-line utility for the smart agriculture demo."""
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smart_agri_iot.settings")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
